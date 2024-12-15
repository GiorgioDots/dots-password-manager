using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.GetPassword;

internal sealed class Endpoint : Endpoint<GetPasswordRequest, SavedPasswordDTO>
{
    public DPMDbContext _db { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Get("/passwords/{Id}");
        Roles("User");
    }

    public override async Task HandleAsync(GetPasswordRequest req, CancellationToken c)
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

        var password = await _db.SavedPasswords.FirstOrDefaultAsync(k => k.UserId == userId && k.Id == req.Id);
        if (password == null)
        {
            ThrowError("Not Found");
        }

        await SendOkAsync(_mapper.FromEntity(password, user!), c);
    }
}

internal sealed class GetPasswordRequest
{
    public Guid Id { get; set; }
}
