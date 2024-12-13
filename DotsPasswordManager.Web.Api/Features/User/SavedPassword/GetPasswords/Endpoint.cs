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

        var passwords = await _db.SavedPasswords.Where(k => k.UserId == userId)
            .Select(k => _mapper.FromEntity(k)).ToListAsync();

        await SendOkAsync(passwords, c);
    }
}