using System.Security.Cryptography;
using System.Text;

namespace DotsPasswordManager.Web.Api.Services.Crypto;

public class OptimizedCryptoService
{
    private readonly string password;

    public OptimizedCryptoService(AppSettings appSettings)
    {
        password = appSettings.CryptoBase64Key;
    }

    public string Encrypt(string plainText, string userSalt)
    {
        // Genera il salt e crea la chiave/IV
        byte[] salt = Convert.FromBase64String(userSalt);
        using (var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256))
        {
            byte[] key = deriveBytes.GetBytes(32);
            byte[] iv = deriveBytes.GetBytes(16);

            // Cripta il testo
            string encryptedText = Encrypt(plainText, key, iv);

            // Combina salt e testo criptato in Base64
            return encryptedText;
        }
    }

    public string Decrypt(string encrypted, string userSalt)
    {
        // Separare il salt dal testo criptato
        byte[] salt = Convert.FromBase64String(userSalt);

        // Ricrea la chiave e l'IV
        using (var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256))
        {
            byte[] key = deriveBytes.GetBytes(32);
            byte[] iv = deriveBytes.GetBytes(16);

            // Decripta il testo
            return Decrypt(encrypted, key, iv);
        }
    }

    public List<DB.SavedPassword> DecryptPasswords(List<DB.SavedPassword> passwords, string userSalt)
    {
        byte[] salt = Convert.FromBase64String(userSalt);
        using var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);

        byte[] key = deriveBytes.GetBytes(32);
        byte[] iv = deriveBytes.GetBytes(16);

        using Aes aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        foreach (var password in passwords)
        {
            using (var ms = new System.IO.MemoryStream(Convert.FromBase64String(password.PasswordHash)))
            {
                using (var cryptoStream = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read))
                {
                    using (var reader = new System.IO.StreamReader(cryptoStream))
                    {
                        password.PasswordHash =  reader.ReadToEnd(); // Lettura completa, compreso il padding
                    }
                }
            }
        }

        return passwords;
    }

    private string Encrypt(string plainText, byte[] key, byte[] iv)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = key;
            aes.IV = iv;

            using (var ms = new System.IO.MemoryStream())
            {
                using (var cryptoStream = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    using (var writer = new System.IO.StreamWriter(cryptoStream))
                    {
                        writer.Write(plainText);
                    }
                }
                return Convert.ToBase64String(ms.ToArray());
            }
        }
    }

    private string Decrypt(string encryptedText, byte[] key, byte[] iv)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = key;
            aes.IV = iv;

            using (var ms = new System.IO.MemoryStream(Convert.FromBase64String(encryptedText)))
            {
                using (var cryptoStream = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read))
                {
                    using (var reader = new System.IO.StreamReader(cryptoStream))
                    {
                        return reader.ReadToEnd(); // Lettura completa, compreso il padding
                    }
                }
            }
        }
    }
}