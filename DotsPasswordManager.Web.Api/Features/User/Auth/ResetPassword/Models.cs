namespace User.Auth.ResetPassword;

internal sealed class Request
{
    public string RequestId { get; set; }
    public string NewPassword { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.RequestId).NotEmpty();
            RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
        }
    }
}

internal sealed class Response
{
    public string Message { get; set; }
}
