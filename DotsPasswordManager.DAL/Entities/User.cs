using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DB;

public class User
{
    [Key]
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string OriginalUsername { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string Salt { get; set; }

    public ICollection<SavedPassword> SavedPasswords { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; }
}

