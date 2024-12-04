namespace User.SavedPassword.GetPasswords;

internal sealed class Response
{
    public IEnumerable<Password> passwords { get; set; }
    internal class Password
    {
        public Guid Id { get; set; }
        public string Login { get; set; }
        public string PasswordHash { get; set; }
        public string Url { get; set; }
        public string Notes { get; set; }
        public string[] Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
