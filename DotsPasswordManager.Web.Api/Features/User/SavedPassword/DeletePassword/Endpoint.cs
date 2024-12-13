using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Crypto;
using User.SavedPassword._DTOs;

namespace User.SavedPassword.DeletePassword;

internal sealed class Endpoint : Endpoint<DeletePasswordRequest, DeletePasswordResponse>
{
    public DPMDbContext _db { get; set; }
    public SavedPasswordMapper _mapper { get; set; }

    public override void Configure()
    {
        Delete("/passwords/{Id}");
        Roles("User");
    }

    public override async Task HandleAsync(DeletePasswordRequest req, CancellationToken c)
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

        _db.Remove(password);
        await _db.SaveChangesAsync(c);

        await SendOkAsync(new()
        {
            Message = "Password deleted"
        }, c);
    }
}

internal sealed class DeletePasswordRequest
{
    public Guid Id { get; set; }
}

internal sealed class DeletePasswordResponse
{
    public string Message { get; set; }
}