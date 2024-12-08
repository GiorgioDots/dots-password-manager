using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Text.Json;

namespace User.SavedPassword.GetPasswords;

internal sealed class Endpoint : EndpointWithoutRequest<List<PasswordResponse>>
{
    public IdbConnectionFactory _dbFactory { get; set; }
    public ClientCryptoService clientCrypto { get; set; }
    public CryptoService crypto { get; set; }

    public override void Configure()
    {
        Get("/passwords");
        Roles("User");
    }

    public override async Task HandleAsync(CancellationToken c)
    {
        var userId = User.Claims.GetUserId(); 
        if (userId == null)
        {
            await SendOkAsync([], c);
            return;
        }

        using var _db = await _dbFactory.CreateConnectionAsync(c);

        var passwords = await Data.GetPasswords(_db, userId.Value);
        var publicKey = HttpContext.Request.Headers.GetPublicKey();
        var retPasswords = passwords
            .Select(k => new PasswordResponse
            {
                Id = k.Id,
                Name = k.Name,
                Notes = k.Notes,
                Tags = k.Tags,
                Url = k.Url,
                CreatedAt = k.CreatedAt,
                UpdatedAt = k.UpdatedAt,
            }).ToList();

        await SendOkAsync(retPasswords, c);
    }
}