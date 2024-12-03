using System.Data;

namespace User.Login;

internal sealed class Data
{
    internal record AreCredentialsValidResult (RegisteredUser? user, bool credentialsValid);
    internal static async Task<AreCredentialsValidResult> AreCredentialsValid(IDbConnection db, string email, string password)
    {
        var user = await db.QuerySingleOrDefaultAsync<RegisteredUser>("SELECT * FROM users WHERE email = @Email", new { email });
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
