
namespace User.Register;

internal sealed class Endpoint : Endpoint<Request, Response, Mapper>
{
    public readonly IdbConnectionFactory _dbFactory;

    public Endpoint(IdbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/register");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var user = Map.ToEntity(r);

        using var _db = await _dbFactory.CreateConnectionAsync(c);

        var emailIsTaken = Data.EmailAddressIsTaken(_db, user.Email);
        if (emailIsTaken)
        {
            AddError("Email is already taken.");
        }

        var usernameIsTaken = Data.UsernameIsTaken(_db, user.Username);
        if (usernameIsTaken)
        {
            AddError("Username is already taken.");
        }

        ThrowIfAnyErrors();

        var userId = await Data.CreateNewUser(_db, user);

        await SendOkAsync(new Response { UserId = userId }, c);
    }
}