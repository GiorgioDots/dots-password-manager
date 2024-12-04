using System.Data;

namespace User.RefreshToken;

internal sealed class Data
{
    internal static async Task<DB.RefreshToken?> GetRefreshToken(IDbConnection db, string refreshToken) =>
        await db.QuerySingleOrDefaultAsync<DB.RefreshToken>(
            "SELECT * FROM refreshtokens WHERE token = @Token AND revokedat IS NULL",
            new { Token = refreshToken }
        );

    internal static async Task<DB.User?> GetUser(IDbConnection db, Guid userId) =>
        await db.QuerySingleOrDefaultAsync<DB.User>("SELECT * FROM users WHERE id = @UserId", new { UserId = userId });

    internal static async Task RevokeToken(IDbConnection db, Guid tokenId) =>
        await db.ExecuteAsync(
            "UPDATE refreshtokens SET revokedat = @RevokedAt WHERE id = @Id",
            new { RevokedAt = DateTime.UtcNow, Id = tokenId }
        );

    internal static async Task CreateRefreshToken(IDbConnection db, Guid userId, string refreshToken)
    {
        await db.ExecuteAsync(
            "INSERT INTO refreshtokens (userid, token, expiresat) VALUES (@UserId, @Token, @ExpiresAt)",
            new { UserId = userId, Token = refreshToken, ExpiresAt = DateTime.UtcNow.AddDays(7) }
        );
    }
}
