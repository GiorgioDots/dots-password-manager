﻿namespace User.Auth.Register;

internal sealed class Endpoint : Endpoint<Request, Response, Mapper>
{
    public DPMDbContext _db { get; set; }

    public override void Configure()
    {
        Verbs(Http.POST);
        Routes("/auth/register");
        AllowAnonymous();
        Validator<Request.Validator>();
    }

    public override async Task HandleAsync(Request r, CancellationToken c)
    {
        var user = Map.ToEntity(r);
        
        var emailIsTaken = await _db.Users.AnyAsync(k => k.Email == user.Email.ToLower());
        if (emailIsTaken)
        {
            AddError("Email is already taken.");
        }

        var usernameIsTaken = await _db.Users.AnyAsync(k => k.Username == user.Username.ToLower());
        if (usernameIsTaken)
        {
            AddError("Username is already taken.");
        }

        ThrowIfAnyErrors();

        _db.Add(user);
        await _db.SaveChangesAsync(c);

        await SendOkAsync(new Response { UserId = user.Id }, c);
    }
}