using DotsPasswordManager.Web.Api.Services.Email;

namespace User.Auth.ResetPassword;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public DPMDbContext _db { get; set; }
    public EmailService _emailService { get; set; }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/reset-password");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var request = await _db.UserRequests.FirstOrDefaultAsync(k => 
            k.Id == new Guid(r.RequestId) && k.ExpiresAt > DateTime.UtcNow && k.RequestType == DB.Enums.eUserRequestTypes.PASSWORD_RESET
        );
        if(request == null)
        {
            ThrowError("The request is expired or not valid");
        }

        var user = await _db.Users.FirstOrDefaultAsync(k => k.Id == request.UserId);
        if (user == null)
        {
            ThrowError("The request is expired or not valid");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(r.NewPassword, user.PasswordSalt);
        user.PasswordHash = passwordHash;
        request.ExpiresAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await SendOkAsync(new Response()
        {
            Message = "Your password has been resetted, please login again"
        }, c);
    }
}