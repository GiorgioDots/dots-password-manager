using DotsPasswordManager.Web.Api.Services.Auth;
using DotsPasswordManager.Web.Api.Services.Crypto;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using System.Security.Claims;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddSingleton(_ =>
    new DatabaseInitializer(builder.Configuration["DbConnectionString"]!));
builder.Services.AddSingleton<IdbConnectionFactory>(_ =>
    new NpgsqlDbConnectionFactory(builder.Configuration["DbConnectionString"]!));

builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<ClientCryptoService>();
builder.Services.AddSingleton<CryptoService>();

builder.Services.AddAuthenticationJwtBearer(
    s =>
    {
        s.SigningKey = builder.Configuration["Jwt:Secret"]!;
    },
    b =>
    {
        b.TokenValidationParameters.ValidIssuer = builder.Configuration["Jwt:Issuer"];
        b.TokenValidationParameters.ValidAudience = builder.Configuration["Jwt:Audience"];
        b.TokenValidationParameters.ValidateLifetime = true;
        b.TokenValidationParameters.ClockSkew = TimeSpan.Zero;
    }
);
builder.Services.Configure<JwtCreationOptions>(o =>
{
    o.SigningKey = builder.Configuration["Jwt:Secret"]!;
    o.Issuer = builder.Configuration["Jwt:Issuer"];
    o.Audience = builder.Configuration["Jwt:Audience"];
});
builder.Services.AddAuthorization();
builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument();

builder.Services.AddCors(o => o.AddPolicy("cors", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseCors("cors");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseFastEndpoints(c =>
{
    c.Security.RoleClaimType = ClaimTypes.Role;
    c.Serializer.Options.PropertyNamingPolicy = null;
    c.Serializer.Options.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen();
}

var initializer = app.Services.GetRequiredService<DatabaseInitializer>();
await initializer.InitializeAsync();

app.Run();