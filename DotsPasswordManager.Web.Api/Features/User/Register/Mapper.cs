namespace User.Register;

internal sealed class Mapper : Mapper<Request, Response, RegisteredUser>
{
    public override RegisteredUser ToEntity(Request r)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(r.Password);
        var user = new RegisteredUser { Email = r.Email, Username = r.Username, PasswordHash = passwordHash };
        return user;
    }
}