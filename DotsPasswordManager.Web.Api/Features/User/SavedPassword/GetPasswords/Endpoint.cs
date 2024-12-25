using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.GetPasswords;

internal sealed class Endpoint : EndpointWithoutRequest<List<SavedPasswordDTO>>
{
    public DPMDbContext _db{ get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Get("/api/passwords");
        Roles("User");
    }

    public override async Task HandleAsync(CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            ThrowError("User not found");
        }

        var user = await _db.Users.FirstOrDefaultAsync(k => k.Id == userId);

        if (user == null)
        {
            ThrowError("User not found");
        }

        var passwords = await _db.SavedPasswords.Where(k => k.UserId == userId).ToListAsync();

        var ret = _mapper.FromEntities(passwords, user!);

        await SendOkAsync(ret, c);
    }
}