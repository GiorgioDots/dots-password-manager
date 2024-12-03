using System.Data;

namespace User.SavedPasswords.GetPasswords;

internal sealed class Data
{
    internal static async Task<IEnumerable<SavedPassword>> GetPasswords(IDbConnection db, Guid userId) =>
        await db.QueryAsync<SavedPassword>(
            "SELECT * FROM savedpasswords WHERE userid = @UserId",
            new { UserId = userId }
        );
}
