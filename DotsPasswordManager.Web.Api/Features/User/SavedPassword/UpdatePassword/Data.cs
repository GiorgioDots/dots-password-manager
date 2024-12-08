using System.Data;

namespace User.SavedPassword.UpdatePassword;

internal sealed class Data
{
    public static async Task<DB.SavedPassword?> GetPassword(IDbConnection db, Guid? userId, Guid pwdId)
    {
        var pwd = await db.QuerySingleAsync<DB.SavedPassword>(@"
           SELECT * FROM SavedPasswords WHERE Id = @Id AND UserId = @IdUser 
        ", new { Id = pwdId, IdUser = userId });
        return pwd;
    }

    internal static async Task<DB.SavedPassword> UpdatePassword(IDbConnection db, Guid? userId, DB.SavedPassword password)
    {
        await db.ExecuteAsync(@"
            UPDATE SavedPasswords SET 
                Name = @Name, Login = @Login, SecondLogin = @SecondLogin, 
                PasswordHash = @PasswordHash, Url = @Url, Notes = @Notes, Tags = @Tags
            WHERE Id = @Id
        ", password);
        return await db.QuerySingleAsync<DB.SavedPassword>(@"SELECT * FROM SavedPasswords WHERE Id = @Id", password);
    }
}
