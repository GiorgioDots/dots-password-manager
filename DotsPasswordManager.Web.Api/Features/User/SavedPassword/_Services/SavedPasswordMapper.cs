using DB;
using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Security.Cryptography.X509Certificates;
using User.SavedPassword._DTOs;

namespace DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;

public class SavedPasswordMapper
{
    private readonly CryptoService cryptoService;
    private readonly ClientCryptoService clientCrypto;
    private readonly IHttpContextAccessor httpContext;

    public SavedPasswordMapper(CryptoService cryptoService, ClientCryptoService clientCrypto, IHttpContextAccessor httpContext)
    {
        this.cryptoService = cryptoService;
        this.clientCrypto = clientCrypto;
        this.httpContext = httpContext;
    }


    public SavedPasswordDTO FromEntity(DB.SavedPassword entity)
    {
        if (httpContext.HttpContext == null) return new();

        var publicKey = httpContext.HttpContext.Request.Headers.GetPublicKey();
        return new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Login = clientCrypto.Encrypt(entity.Login, publicKey),
            SecondLogin = entity.SecondLogin == null ? null : clientCrypto.Encrypt(entity.SecondLogin, publicKey),
            Password = clientCrypto.Encrypt(cryptoService.Decrypt(entity.PasswordHash), publicKey),
            Url = entity.Url,
            Notes = entity.Notes,
            Tags = entity.Tags,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public DB.SavedPassword ToEntity(SavedPasswordDTO r)
    {
        return new()
        {
            Name = r.Name,
            Login = r.Login,
            SecondLogin = r.SecondLogin,
            PasswordHash = cryptoService.Encrypt(r.Password),
            Url = r.Url,
            Notes = r.Notes,
            Tags = r.Tags,
        };
    }
}
