namespace User.Auth.Register;

internal sealed class Request
{
    public string Email { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Username).NotEmpty().MinimumLength(3);
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        }
    }
}

internal sealed class Response
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}
