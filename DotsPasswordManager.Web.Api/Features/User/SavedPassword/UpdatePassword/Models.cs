namespace User.SavedPassword.UpdatePassword;

internal sealed class Request
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Login { get; set; }
    public string SecondLogin { get; set; }
    public string Password { get; set; }
    public string Url { get; set; }
    public string Notes { get; set; }
    public string[] Tags { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");
            RuleFor(x => x.Login)
                .NotEmpty().WithMessage("Login is required.")
                .MaximumLength(100).WithMessage("Login cannot exceed 100 characters.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("PasswordHash is required.");
        }
    }
}

internal class Response
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
