namespace User.SavedPassword.GetPassword;

internal sealed class PasswordResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Login { get; set; }
    public string? SecondLogin { get; set; }
    public string Password { get; set; }
    public string Url { get; set; }
    public string Notes { get; set; }
    public string[] Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

internal sealed class GetPasswordRequest
{
    public Guid Id { get; set; }
}