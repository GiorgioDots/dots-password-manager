using System.Data;

namespace User.SavedPassword.CreatePassword;

internal sealed class Data
{
    internal static async Task<DB.SavedPassword> CreatePassword(IDbConnection db, DB.SavedPassword savedPassword)
    {
        var id = await db.QuerySingleAsync<Guid>(
        @"INSERT INTO public.savedpasswords(userid, login, name, secondlogin, passwordhash, url, notes, tags)" +
        @"VALUES (@UserId, @Login, @Name, @SecondLogin, @PasswordHash, @Url, @Notes, @Tags) RETURNING id;",
            savedPassword
        );
        return await db.QuerySingleAsync<DB.SavedPassword>(@"SELECT * FROM savedpasswords WHERE id = @Id", new { Id = id });
    }
}
