using DB;
using DotsPasswordManager.Web.Api.Services.Auth;

namespace User.Auth.RefreshToken;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public DPMDbContext _db { get; set; }
    public IJwtService _jwtService { get; set; }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/refresh-token");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(k => k.Token == r.Token && k.RevokedAt == null);

        if (token == null || token.ExpiresAt <= DateTime.UtcNow)
            ThrowError("Invalid or expired refresh token.");

        var user = await _db.Users.FirstOrDefaultAsync(k => k.Id == token.UserId);
        if (user == null)
            ThrowError("User not found.");

        var newJwt = _jwtService.GenerateJwt(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        token.RevokedAt = DateTime.UtcNow;

        _db.RefreshTokens.Add(new()
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(Config.GetValue<int>("Jwt:RefreshTokenExpirationDays"))
        });

        await _db.SaveChangesAsync(c);

        await SendOkAsync(new Response { Token = newJwt, RefreshToken = newRefreshToken }, c);
    }
}