namespace User.Auth.ResetPasswordRequest;

internal sealed class Request
{
    public string Email { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }
    }
}

internal sealed class Response
{
    public string Message { get; set; }
}
