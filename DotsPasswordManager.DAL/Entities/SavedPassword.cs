using System.ComponentModel.DataAnnotations;

namespace DB;

public class SavedPassword
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public string Login { get; set; }
    public string? SecondLogin { get; set; }
    public string PasswordHash { get; set; }
    public bool IsFavourite { get; set; }
    public string Url { get; set; }
    public string Notes { get; set; }
    public string[] Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
