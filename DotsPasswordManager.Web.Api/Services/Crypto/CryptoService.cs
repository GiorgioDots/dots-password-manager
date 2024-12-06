using System.Security.Cryptography;

namespace DotsPasswordManager.Web.Api.Services.Crypto;

public class CryptoService
{
    private readonly string password;

    public CryptoService(IConfiguration config)
    {
        password = config["Crypto:Base64Key"]!;
    }

    public string Encrypt(string plainText)
    {
        // Genera il salt e crea la chiave/IV
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        using (var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256))
        {
            byte[] key = deriveBytes.GetBytes(32);
            byte[] iv = deriveBytes.GetBytes(16);

            // Cripta il testo
            string encryptedText = Encrypt(plainText, key, iv);

            // Combina salt e testo criptato in Base64
            return Convert.ToBase64String(salt) + ":" + encryptedText;
        }
    }

    public string Decrypt(string encryptedWithSalt)
    {
        // Separare il salt dal testo criptato
        string[] parts = encryptedWithSalt.Split(':');
        byte[] salt = Convert.FromBase64String(parts[0]);
        string encryptedText = parts[1];

        // Ricrea la chiave e l'IV
        using (var deriveBytes = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256))
        {
            byte[] key = deriveBytes.GetBytes(32);
            byte[] iv = deriveBytes.GetBytes(16);

            // Decripta il testo
            return Decrypt(encryptedText, key, iv);
        }
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
