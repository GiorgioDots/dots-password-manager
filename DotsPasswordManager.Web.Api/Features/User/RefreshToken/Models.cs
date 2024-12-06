namespace User.RefreshToken;

internal sealed class Request
{
    public string Token { get; set; }
    public string PublicKey { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Token).NotEmpty();
        }
    }
}

internal sealed class Response
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}
