using DB;
using DotsPasswordManager.Web.Api.Extensions;
using DotsPasswordManager.Web.Api.Services.Auth;

namespace User.Auth.Login;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public DPMDbContext _db { get; set; }
    public IJwtService _jwtService { get; set; }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/login");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var uq = _db.Users
            .Where(k => k.Email == r.Login.ToLower() || k.Username == r.Login.ToLower());
        var user = await uq.FirstOrDefaultAsync();
        if (user == null || BCrypt.Net.BCrypt.Verify(user.PasswordHash, user.PasswordHash))
        {
            ThrowError("Invalid credentials.");
        }

        var jwt = _jwtService.GenerateJwt(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        _db.RefreshTokens.Add(new()
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(Config.GetValue<int>("Jwt:RefreshTokenExpirationDays"))
        });

        await _db.SaveChangesAsync(c);

        await SendOkAsync(new Response { Token = jwt, RefreshToken = refreshToken }, c);
    }
}