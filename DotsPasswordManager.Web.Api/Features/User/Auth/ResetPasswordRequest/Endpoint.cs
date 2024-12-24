using DB.Enums;
using DotsPasswordManager.Web.Api.Services.Email;

namespace User.Auth.ResetPasswordRequest;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public DPMDbContext _db { get; set; }
    public EmailService _emailService { get; set; }
    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/reset-password-request");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var user = await _db.Users.FirstOrDefaultAsync(k => k.Email == r.Email);
        var response = new Response()
        {
            Message = "Check your emails and click the link to continue, the request will be valid for the next 10 minutes"
        };
        if (user == null)
        {
            await SendOkAsync(response, c);
            return;
        }

        var requests = _db.UserRequests.ToList();

        var request = new DB.UserRequests
        {
            UserId = user.Id,
            RequestType = eUserRequestTypes.PASSWORD_RESET,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            CreatedAt = DateTime.UtcNow 
        };
        _db.UserRequests.Add(request);

        await _db.SaveChangesAsync();

        await _emailService.SendPasswordResetRequestEmail(user, request.Id.ToString());

        await SendOkAsync(response, c);
    }
}