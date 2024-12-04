namespace User.SavedPassword.GetPasswords;

internal sealed class Mapper : ResponseMapper<Response, IEnumerable<DB.SavedPassword>>
{
    public override Response FromEntity(IEnumerable<DB.SavedPassword> e)
    {
        // todo, passwordHash => password
        var pwds = e.Select(k => new Response.Password
        {
            Id = k.Id,
            CreatedAt = k.CreatedAt,
            Login = k.Login,
            Notes = k.Notes,
            PasswordHash = k.PasswordHash,
            Tags = k.Tags,
            UpdatedAt = k.UpdatedAt,
            Url = k.Url,
        });

        return new Response
        {
            passwords = pwds
        };
    }
}