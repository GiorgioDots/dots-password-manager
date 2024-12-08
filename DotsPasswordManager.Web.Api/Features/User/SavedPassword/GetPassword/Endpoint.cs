using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;

namespace User.SavedPassword.GetPassword;

internal sealed class Endpoint : Endpoint<GetPasswordRequest, PasswordResponse>
{
    public IdbConnectionFactory _dbFactory { get; set; }
    
    public ClientCryptoService clientCrypto { get; set; }
    public CryptoService crypto { get; set; }

    public override void Configure()
    {
        Get("/passwords/{Id}");
        Roles("User");
    }

    public override async Task HandleAsync(GetPasswordRequest req, CancellationToken ct)
    {
        var pwdId = req.Id;
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            ThrowError("Invalid user id");
        }
        try
        {
            using var _db = await _dbFactory.CreateConnectionAsync(ct);
            var password = await Data.GetPassword(_db, userId, pwdId);

            if (password == null)
            {
                ThrowError("Not Found");
            }

            var publicKey = HttpContext.Request.Headers.GetPublicKey();
            var ret = new PasswordResponse()
            {
                Id = password.Id,
                Name = password.Name,
                Login = clientCrypto.Encrypt(password.Login, publicKey),
                SecondLogin = password.SecondLogin == null ? null : clientCrypto.Encrypt(password.SecondLogin, publicKey),
                Password = clientCrypto.Encrypt(crypto.Decrypt(password.PasswordHash), publicKey),
                Notes = password.Notes,
                Tags = password.Tags,
                Url = password.Url,
                CreatedAt = password.CreatedAt,
                UpdatedAt = password.UpdatedAt,
            };

            await SendOkAsync(ret, ct);

        }
        catch (Exception e)
        {

            throw;
        }
        
    }
}