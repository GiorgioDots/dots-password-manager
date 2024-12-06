using System.Security.Cryptography;

namespace DotsPasswordManager.Web.Api.Services.Crypto;

public class ClientCryptoService
{
    public string Encrypt(string text, string publicKeyBase64)
    {
        var publicKeyBytes = Convert.FromBase64String(publicKeyBase64);
        using var rsa = RSA.Create();
        rsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out _);
        var dataBytes = System.Text.Encoding.UTF8.GetBytes(text);
        var encryptedBytes = rsa.Encrypt(dataBytes, RSAEncryptionPadding.OaepSHA256);
        return Convert.ToBase64String(encryptedBytes);
    }
}
