namespace User.Register;

internal sealed class Mapper : Mapper<Request, Response, DB.User>
{
    public override DB.User ToEntity(Request r)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(r.Password);
        var user = new DB.User { Email = r.Email, Username = r.Username.ToLower(), PasswordHash = passwordHash, OriginalUsername = r.Username };
        return user;
    }
}