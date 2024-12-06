using System.Data;

namespace User.Login;

internal sealed class Data
{
    internal record AreCredentialsValidResult (DB.User? user, bool credentialsValid);
    internal static async Task<AreCredentialsValidResult> AreCredentialsValid(IDbConnection db, string login, string password)
    {
        var user = await db.QuerySingleOrDefaultAsync<DB.User>("SELECT * FROM users WHERE email = @Login OR username = @Login", new { Login = login });
        return new (user, !(user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)));
    }

    internal static async Task CreateRefreshToken(IDbConnection db, Guid userId, string refreshToken)
    {
        await db.ExecuteAsync(
            "INSERT INTO refreshtokens (userid, token, expiresat) VALUES (@UserId, @Token, @ExpiresAt)",
            new { UserId = userId, Token = refreshToken, ExpiresAt = DateTime.UtcNow.AddDays(7) }
        );
    }
}
