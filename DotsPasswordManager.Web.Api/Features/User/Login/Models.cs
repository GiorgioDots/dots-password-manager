﻿namespace User.Login;

internal sealed class Request
{
    public string Login { get; set; }
    public string Password { get; set; }

    public string PublicKey { get; set; }

    internal sealed class Validator : Validator<Request>
    {
        public Validator()
        {
            RuleFor(x => x.Login).NotEmpty().MinimumLength(2);
            RuleFor(x => x.Password).NotEmpty();
            RuleFor(x => x.PublicKey).NotEmpty();
        }
    }
}

internal sealed class Response
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
}
