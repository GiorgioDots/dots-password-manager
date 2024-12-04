using DotsPasswordManager.Web.Api.Extensions;

namespace User.SavedPassword.GetPasswords;

internal sealed class Endpoint : EndpointWithoutRequest<Response, Mapper>
{
    public readonly IdbConnectionFactory _dbFactory;

    public Endpoint(IdbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public override void Configure()
    {
        Verbs(Http.GET);
        Routes("/passwords");
        Roles("User");
    }

    public override async Task HandleAsync(CancellationToken c)
    {
        var userId = User.Claims.GetUserId(); 
        if (userId == null)
        {
            await SendOkAsync(Map.FromEntity([]), c);
            return;
        }

        using var _db = await _dbFactory.CreateConnectionAsync(c);

        var passwords = await Data.GetPasswords(_db, userId.Value);

        await SendOkAsync(Map.FromEntity(passwords), c);
    }
}