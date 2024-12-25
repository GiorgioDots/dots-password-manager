using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.Export;

internal sealed class Endpoint : EndpointWithoutRequest<ImportExportDTO>
{
    public DPMDbContext _db { get; set; }
    public OptimizedCryptoService _cryptoService { get; set; }

    public override void Configure()
    {
        Get("/api/passwords/export");
        Roles("User");
    }

    public override async Task HandleAsync(CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            ThrowError("Invalid user id");
        }

        var user = await _db.Users.FirstOrDefaultAsync(k => k.Id == userId);
        if (user == null)
        {
            ThrowError("Invalid user id");
        }

        var passwords = await _db.SavedPasswords.Where(k => k.UserId == userId).ToListAsync();
        if (passwords == null)
        {
            ThrowError("Not Found");
        }

        var decrypted = _cryptoService.DecryptPasswords(passwords, user.Salt);

        var toexport = new ImportExportDTO
        {
            AUTHENTIFIANT = decrypted
                .Select(k => new ImportExportPasswordDTO
                {
                    domain = k.Url,
                    login = k.Login,
                    note = k.Notes,
                    password = k.PasswordHash,
                    secondLogin = k.SecondLogin,
                    title = k.Name,
                    tags = k.Tags,
                })
                .ToArray()
        };

        await SendOkAsync(toexport, c);
    }
}
