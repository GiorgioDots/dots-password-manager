using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.ToggleFavourite;

internal sealed class Endpoint : Endpoint<ToggleFavouriteRequest, SavedPasswordDTO>
{
    public DPMDbContext _db { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Get("/passwords/{Id}/toggle-favourite");
        Roles("User");
    }

    public override async Task HandleAsync(ToggleFavouriteRequest req, CancellationToken ct)
    {
        var userId = User.Claims.GetUserId();
        if (userId == null)
        {
            ThrowError("Invalid user id");
        }

        var password = await _db.SavedPasswords.FirstOrDefaultAsync(k => k.UserId == userId && k.Id == req.Id);
        if (password == null)
        {
            ThrowError("Not Found");
        }
        password.IsFavourite = !password.IsFavourite;
        await _db.SaveChangesAsync(ct);


        await SendOkAsync(_mapper.FromEntity(password), ct);
    }
}

internal sealed class ToggleFavouriteRequest
{
    public Guid Id { get; set; }
}