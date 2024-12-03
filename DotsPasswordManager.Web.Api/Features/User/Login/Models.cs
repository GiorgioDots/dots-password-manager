namespace User.Login;

internal sealed class Request
{
    public string Email { get; set; }
    public string Password { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }
}

internal sealed class Response
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}
