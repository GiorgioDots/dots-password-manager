using DB;
using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Security.Cryptography.X509Certificates;
using User.SavedPassword._DTOs;

namespace DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;

public class SavedPasswordMapper
{
    private readonly OptimizedCryptoService cryptoService;
    private readonly ClientCryptoService clientCrypto;
    private readonly IHttpContextAccessor httpContext;

    public SavedPasswordMapper(OptimizedCryptoService cryptoService, ClientCryptoService clientCrypto, IHttpContextAccessor httpContext,
        DPMDbContext dc)
    {
        this.cryptoService = cryptoService;
        this.clientCrypto = clientCrypto;
        this.httpContext = httpContext;
    }

    public SavedPasswordDTO FromEntity(DB.SavedPassword entity, DB.User user)
    {
        if (httpContext.HttpContext == null) return new();

        var publicKey = httpContext.HttpContext.Request.Headers.GetPublicKey();
        if (publicKey == null) throw new Exception("Public key cannot be null");

        return new()
        {
            PasswordId = entity.Id,
            Name = entity.Name,
            Login = clientCrypto.Encrypt(entity.Login, publicKey),
            SecondLogin = entity.SecondLogin == null ? null : clientCrypto.Encrypt(entity.SecondLogin, publicKey),
            Password = clientCrypto.Encrypt(cryptoService.Decrypt(entity.PasswordHash, user.Salt), publicKey),
            Url = entity.Url,
            Notes = entity.Notes,
            Tags = entity.Tags,
            IsFavourite = entity.IsFavourite,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public DB.SavedPassword ToEntity(SavedPasswordDTO r, DB.User user)
    {
        return new()
        {
            Name = r.Name,
            Login = r.Login,
            SecondLogin = r.SecondLogin,
            PasswordHash = cryptoService.Encrypt(r.Password, user.Salt),
            IsFavourite = r.IsFavourite,
            Url = r.Url,
            Notes = r.Notes,
            Tags = r.Tags,
        };
    }

    public List<DB.SavedPassword> ToEntities(List<SavedPasswordDTO> passwords, DB.User user)
    {
        return cryptoService.EncryptPasswords(passwords, user.Salt)
            .Select(r => new DB.SavedPassword()
            {
                Name = r.Name,
                Login = r.Login,
                SecondLogin = r.SecondLogin,
                PasswordHash = r.Password,
                IsFavourite = r.IsFavourite,
                Url = r.Url,
                Notes = r.Notes,
                Tags = r.Tags,
            })
            .ToList();
    }

    internal List<SavedPasswordDTO> FromEntities(List<DB.SavedPassword> passwords, DB.User user)
    {
        if (httpContext.HttpContext == null) return [];

        var publicKey = httpContext.HttpContext.Request.Headers.GetPublicKey();
        if (publicKey == null) throw new Exception("Public key cannot be null");

        var decrypted = cryptoService.DecryptPasswords(passwords, user.Salt);

        return decrypted.Select(entity => new SavedPasswordDTO()
        {
            PasswordId = entity.Id,
            Name = entity.Name,
            //Login = clientCrypto.Encrypt(entity.Login, publicKey),
            //SecondLogin = entity.SecondLogin == null ? null : clientCrypto.Encrypt(entity.SecondLogin, publicKey),
            //Password = clientCrypto.Encrypt(entity.PasswordHash, publicKey),
            Url = entity.Url,
            Notes = entity.Notes,
            Tags = entity.Tags,
            IsFavourite = entity.IsFavourite,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        }).ToList();
    }
}
