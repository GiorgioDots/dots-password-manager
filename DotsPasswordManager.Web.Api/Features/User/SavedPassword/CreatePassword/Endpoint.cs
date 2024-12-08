using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;

namespace User.SavedPassword.CreatePassword;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public IdbConnectionFactory _dbFactory { get; set; }
    public CryptoService _cryptoService { get; set; }
    public ClientCryptoService _clientCrypto { get; set; }

    public override void Configure()
    {
        Post("/passwords/create");
        Roles("User");
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if(userId == null)
        {
            this.AddError("User not found");
        }
        ThrowIfAnyErrors();

        var db = await _dbFactory.CreateConnectionAsync(c);

        var savedPassword = new DB.SavedPassword
        {
            Id = Guid.NewGuid(),
            Name = r.Name,
            UserId = userId!.Value,
            Login = r.Login,
            SecondLogin = r.SecondLogin,
            PasswordHash = _cryptoService.Encrypt(r.Password),
            Url = r.Url,
            Notes = r.Notes,
            Tags = r.Tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var createdPassword = await Data.CreatePassword(db, savedPassword);

        var publicKey = HttpContext.Request.Headers.GetPublicKey();

        await SendOkAsync(new Response()
        {
            Id = createdPassword.Id,
            Name = createdPassword.Name,
            Login = _clientCrypto.Encrypt(createdPassword.Login, publicKey),
            SecondLogin = createdPassword.SecondLogin == null ? null : _clientCrypto.Encrypt(createdPassword.SecondLogin, publicKey),
            Password = _clientCrypto.Encrypt(_cryptoService.Decrypt(createdPassword.PasswordHash), publicKey),
            Url = createdPassword.Url,
            Notes = createdPassword.Notes,
            Tags = createdPassword.Tags,
            CreatedAt = createdPassword.CreatedAt,
            UpdatedAt = createdPassword.UpdatedAt
        }, c);
    }
}