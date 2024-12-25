using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Security.Cryptography.X509Certificates;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.UpdatePassword;

internal sealed class Endpoint : Endpoint<SavedPasswordDTO, SavedPasswordDTO>
{
    public DPMDbContext _db{ get; set; }
    public OptimizedCryptoService _cryptoService { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Post("/api/passwords/edit");
        Roles("User");
        Validator<SavedPasswordDTO.Validator>();
    }

    public override async Task HandleAsync(SavedPasswordDTO r, CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            ThrowError("Invalid user id");
        }
        var user = await _db.Users.FirstOrDefaultAsync(k => k.Id == userId);

        if (user == null)
        {
            ThrowError("User not found");
        }

        var password = await _db.SavedPasswords
            .FirstOrDefaultAsync(k => k.Id == r.PasswordId && k.UserId == userId);

        if (password == null)
        {
            ThrowError("Not Found");
        }

        password.Name = r.Name;
        password.Login = r.Login;
        password.SecondLogin = r.SecondLogin;
        password.PasswordHash = _cryptoService.Encrypt(r.Password, user.Salt);
        password.Url = r.Url;
        password.Notes = r.Notes;
        password.Tags = r.Tags;
        password.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(c);

        await SendOkAsync(_mapper.FromEntity(password, user!), c);
    }
}