using System.Data;

namespace User.SavedPassword.GetPassword;

public class Data
{
    public static async Task<DB.SavedPassword?> GetPassword(IDbConnection db, Guid? userId, Guid pwdId)
    {
        var pwd = await db.QuerySingleAsync<DB.SavedPassword>(@"
           SELECT * FROM SavedPasswords WHERE Id = @Id AND UserId = @IdUser 
        ");
        return pwd;
    }
}