﻿using DotsPasswordManager.Web.Api.Extensions;
using User.SavedPassword._DTOs;
using DotsPasswordManager.Web.Api.Services.Crypto;
using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;

namespace User.SavedPassword.CreatePassword;

internal sealed class Endpoint : Endpoint<SavedPasswordDTO, SavedPasswordDTO>
{
    public DPMDbContext _db{ get; set; }
    public SavedPasswordMapper _mapper { get; set; }
    public CryptoService _cryptoService { get; set; }

    public override void Configure()
    {
        Post("/passwords/create");
        Roles("User");
        Validator<SavedPasswordDTO.Validator>();
    }

    public override async Task HandleAsync(SavedPasswordDTO r, CancellationToken c)
    {
        var userId = User.Claims.GetUserId();
        if(userId == null)
        {
            AddError("User not found");
        }
        ThrowIfAnyErrors();

        var savedPassword = _mapper.ToEntity(r);
        savedPassword.UserId = userId!.Value;
        savedPassword.CreatedAt = DateTime.UtcNow;
        savedPassword.UpdatedAt = DateTime.UtcNow;

        _db.Add(savedPassword);
        await _db.SaveChangesAsync(c);

        await SendOkAsync(_mapper.FromEntity(savedPassword), c);
    }
}