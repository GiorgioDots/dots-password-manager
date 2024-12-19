using System;
using System.IO;

public class AppSettings
{
    public string DbConnectionString { get; private set; }
    public string JwtSecret { get; private set; }
    public string CryptoBase64Key { get; private set; }

    public AppSettings()
    {
        // Reading secrets from environment variables pointing to the files
        DbConnectionString = ReadSecretFile(Environment.GetEnvironmentVariable("DB_CONNECTION_STRING_FILE"));
        JwtSecret = ReadSecretFile(Environment.GetEnvironmentVariable("JWT_SECRET_FILE"));
        CryptoBase64Key = ReadSecretFile(Environment.GetEnvironmentVariable("CRYPTO_BASE_64_KEY_FILE"));
    }

    private string ReadSecretFile(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath))
        {
            throw new ArgumentException("Secret file path is not defined.");
        }

        return File.Exists(filePath)
            ? File.ReadAllText(filePath)
            : throw new FileNotFoundException($"Secret file not found: {filePath}");
    }
}
