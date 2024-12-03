namespace User.SavedPasswords.GetPasswords;

internal sealed class Mapper : ResponseMapper<Response, IEnumerable<SavedPassword>>
{
    public override Response FromEntity(IEnumerable<SavedPassword> e)
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