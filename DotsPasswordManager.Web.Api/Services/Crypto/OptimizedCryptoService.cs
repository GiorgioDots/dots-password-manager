using System.Security.Cryptography;
using System.Text;

namespace DotsPasswordManager.Web.Api.Services.Crypto;

public class OptimizedCryptoService
{
    private readonly byte[] _baseKey;
    private readonly int _iterations;
    private readonly HashAlgorithmName _hashAlgorithm;

    public OptimizedCryptoService(IConfiguration config)
    {
        var password = config["Crypto:Base64Key"]!;
        _baseKey = Encoding.UTF8.GetBytes(password);
        _iterations = 100_000;
        _hashAlgorithm = HashAlgorithmName.SHA256;
    }

    public string Encrypt(string plainText)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        (byte[] key, byte[] iv) = DeriveKeyAndIv(salt);

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        using var ms = new MemoryStream();
        using var cryptoStream = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write);
        using var writer = new StreamWriter(cryptoStream);

        writer.Write(plainText);
        writer.Flush();
        cryptoStream.FlushFinalBlock();

        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(ms.ToArray())}";
    }

    public string Decrypt(string encryptedWithSalt)
    {
        var parts = encryptedWithSalt.Split(':');
        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] encryptedBytes = Convert.FromBase64String(parts[1]);

        (byte[] key, byte[] iv) = DeriveKeyAndIv(salt);

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        using var ms = new MemoryStream(encryptedBytes);
        using var cryptoStream = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
        using var reader = new StreamReader(cryptoStream);

        return reader.ReadToEnd();
    }

    private (byte[] Key, byte[] Iv) DeriveKeyAndIv(byte[] salt)
    {
        using var deriveBytes = new Rfc2898DeriveBytes(_baseKey, salt, _iterations, _hashAlgorithm);
        return (
            deriveBytes.GetBytes(32),  // 256-bit key
            deriveBytes.GetBytes(16)   // 128-bit IV
        );
    }

    // Parallel decryption method
    public List<string> DecryptPasswords(IEnumerable<string> encryptedPasswords)
    {
        return encryptedPasswords
            .AsParallel()
            .Select(Decrypt)
            .ToList();
    }
}