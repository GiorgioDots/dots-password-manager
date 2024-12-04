using System.Data;

namespace User.Register;

internal sealed class Data
{
    internal static bool EmailAddressIsTaken(IDbConnection _db, string email) =>
        _db.QuerySingle<bool>(
            @"SELECT EXISTS (SELECT 1 FROM users WHERE email = @Email) AS UserExists", 
            new { Email = email }
        );

    internal static bool UsernameIsTaken(IDbConnection _db, string username) =>
        _db.QuerySingle<bool>(
            @"SELECT EXISTS (SELECT 1 FROM users WHERE username = @Username) AS UserExists",
            new { Username = username }
        );

    internal static async Task<Guid> CreateNewUser(IDbConnection _db, DB.User user) =>
        await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO users (email, username, passwordhash) VALUES (@Email, @Username, @PasswordHash) RETURNING id;", 
            user
        );
}
