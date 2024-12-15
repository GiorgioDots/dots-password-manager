using System.Security.Cryptography;

namespace User.Auth.Register;

internal sealed class Mapper : Mapper<Request, Response, DB.User>
{
    public override DB.User ToEntity(Request r)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(r.Password);
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        var user = new DB.User 
        { 
            Email = r.Email, 
            Username = r.Username.ToLower(), 
            PasswordHash = passwordHash,
            OriginalUsername = r.Username,
            Salt = Convert.ToBase64String(salt)
        };
        return user;
    }
}