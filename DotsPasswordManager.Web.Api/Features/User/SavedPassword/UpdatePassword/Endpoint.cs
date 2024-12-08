using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Security.Cryptography.X509Certificates;

namespace User.SavedPassword.UpdatePassword;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public IdbConnectionFactory _dbFactory { get; set; }
    public CryptoService _cryptoService { get; set; }
    public ClientCryptoService _clientCrypto { get; set; }

    public override void Configure()
    {
        Post("/passwords/edit/{id}");
        Roles("User");
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            this.AddError("User not found");
        }
        ThrowIfAnyErrors();

        var db = await _dbFactory.CreateConnectionAsync(c);
        var password = await Data.GetPassword(db, userId, r.Id);

        if (password == null)
        {
            ThrowError("Not Found");
        }

        password.Name = r.Name;
        password.Login = r.Login;
        password.SecondLogin = r.SecondLogin;
        password.PasswordHash = _cryptoService.Encrypt(r.Password);
        password.Url = r.Url;
        password.Notes = r.Notes;
        password.Tags = r.Tags;

        var savedPassword = await Data.UpdatePassword(db, userId, password);

        var publicKey = HttpContext.Request.Headers.GetPublicKey();

        await SendOkAsync(new Response
        {
            Id = savedPassword.Id,
            Name = savedPassword.Name,
            Login = _clientCrypto.Encrypt(savedPassword.Login, publicKey),
            SecondLogin = savedPassword.SecondLogin == null ? null : _clientCrypto.Encrypt(savedPassword.SecondLogin, publicKey),
            Password = _clientCrypto.Encrypt(_cryptoService.Decrypt(savedPassword.PasswordHash), publicKey),
            Url = savedPassword.Url,
            Notes = savedPassword.Notes,
            Tags = savedPassword.Tags,
            CreatedAt = savedPassword.CreatedAt,
            UpdatedAt = savedPassword.UpdatedAt
        });
    }
}