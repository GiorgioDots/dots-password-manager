using System.Data;

namespace User.SavedPassword.GetPasswords;

internal sealed class Data
{
    internal static async Task<IEnumerable<DB.SavedPassword>> GetPasswords(IDbConnection db, Guid userId) =>
        await db.QueryAsync<DB.SavedPassword>(
            "SELECT * FROM savedpasswords WHERE userid = @UserId",
            new { UserId = userId }
        );
}
