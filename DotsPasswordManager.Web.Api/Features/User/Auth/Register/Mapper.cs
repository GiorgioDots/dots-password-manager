using System.Security.Cryptography;

namespace User.Auth.Register;

internal sealed class Mapper : Mapper<Request, Response, DB.User>
{
    public override DB.User ToEntity(Request r)
    {
        var passwordSalt = BCrypt.Net.BCrypt.GenerateSalt();
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(r.Password, passwordSalt);
        var user = new DB.User 
        { 
            Email = r.Email, 
            Username = r.Username.ToLower(), 
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            OriginalUsername = r.Username,
            Salt = Convert.ToBase64String(salt)
        };
        return user;
    }
}