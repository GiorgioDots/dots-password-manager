using DotsPasswordManager.Web.Api.Services.Auth;

namespace User.Login;

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
        Routes("/auth/login");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        using var _db = await _dbFactory.CreateConnectionAsync(c);
        var result = await Data.AreCredentialsValid(_db, r.Login.ToLower(), r.Password);
        if (!result.credentialsValid)
        {
            ThrowError("Invalid credentials.");
        }

        var jwt = _jwtService.GenerateJwt(result.user!, r.PublicKey);
        var refreshToken = _jwtService.GenerateRefreshToken();

        await Data.CreateRefreshToken(_db, result.user!.Id, refreshToken);

        await SendOkAsync(new Response { Token = jwt, RefreshToken = refreshToken }, c);
    }
}