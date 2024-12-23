using DB;
using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.Import;

internal sealed class Endpoint : Endpoint<ImportExportDTO, Response>
{
    public DPMDbContext _db { get; set; }
    public OptimizedCryptoService _cryptoService { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Post("/passwords/import");
        Roles("User");
        Validator<ImportExportDTO.Validator>();
    }

    public override async Task HandleAsync(ImportExportDTO req, CancellationToken c)
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

        var passwords = req.AUTHENTIFIANT
            .Select(k => new SavedPasswordDTO
            {
                Name = k.title,
                Login = k.login,
                SecondLogin = k.secondLogin,
                Password = k.password,
                Notes = k.note,
                Url = k.domain,
                Tags = k.tags ?? []
            })
            .Select(k => 
            { 
                var mapped = _mapper.ToEntity(k, user); 
                mapped.UserId = user.Id;
                return mapped; 
            });

        _db.SavedPasswords.AddRange(passwords);

        await _db.SaveChangesAsync();

        await SendOkAsync(new Response()
        {
            Message = "Password imported successfully"
        }, c);
    }
}

internal sealed class Response
{
    public string Message { get; set; }
}
