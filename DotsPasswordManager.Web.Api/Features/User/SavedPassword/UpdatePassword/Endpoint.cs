using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using System.Security.Cryptography.X509Certificates;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.UpdatePassword;

internal sealed class Endpoint : Endpoint<SavedPasswordDTO, SavedPasswordDTO>
{
    public DPMDbContext _db{ get; set; }
    public CryptoService _cryptoService { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Post("/passwords/edit/{id}");
        Roles("User");
        Validator<SavedPasswordDTO.Validator>();
    }

    public override async Task HandleAsync(SavedPasswordDTO r, CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            this.AddError("User not found");
        }
        ThrowIfAnyErrors();

        var password = await _db.SavedPasswords
            .FirstOrDefaultAsync(k => k.Id == r.Id && k.UserId == userId);

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
        password.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(c);

        await SendOkAsync(_mapper.FromEntity(password), c);
    }
}