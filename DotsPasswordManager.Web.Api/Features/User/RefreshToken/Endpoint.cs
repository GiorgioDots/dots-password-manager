using DotsPasswordManager.Web.Api.Services.Auth;

namespace User.RefreshToken;

internal sealed class Endpoint : Endpoint<Request, Response>
{
    public readonly IdbConnectionFactory _dbFactory;
    private readonly IJwtService _jwtService;

    public Endpoint(IdbConnectionFactory dbFactory, IJwtService jwtService)
    {
        _dbFactory = dbFactory;
        _jwtService = jwtService;
    }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/refresh-token");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        using var _db = await _dbFactory.CreateConnectionAsync(c);
        var token = await Data.GetRefreshToken(_db, r.Token);

        if (token == null || token.ExpiresAt <= DateTime.UtcNow)
            ThrowError("Invalid or expired refresh token.");

        var user = await Data.GetUser(_db, token.UserId);
        if (user == null)
            ThrowError("User not found.");

        var newJwt = _jwtService.GenerateJwt(user, r.PublicKey);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        await Data.RevokeToken(_db, token.Id);

        await Data.CreateRefreshToken(_db, user.Id, newRefreshToken);

        await SendOkAsync(new Response { Token = newJwt, RefreshToken = newRefreshToken }, c);

    }
}