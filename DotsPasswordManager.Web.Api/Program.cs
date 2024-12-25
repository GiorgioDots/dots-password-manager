using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Auth;
using DotsPasswordManager.Web.Api.Services.Crypto;
using DotsPasswordManager.Web.Api.Services.Email;
using DotsPasswordManager.Web.Api.Utils;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using System.Security.Claims;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Load secrets
var appSettings = new AppSettings();
// Add AppSettings as a singleton service
builder.Services.AddSingleton(appSettings);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddServices(appSettings);

builder.Services.AddHttpContextAccessor();

#if !DEBUG
builder.Services.AddSpaStaticFiles(opt =>
{
    opt.RootPath = "client";
});
#endif

var jwtSecret = appSettings.JwtSecret;
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
            ?? throw new ArgumentNullException("Environment JWT_ISSUER not found");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
            ?? throw new ArgumentNullException("Environment JWT_AUDIENCE not found");
builder.Services.AddAuthenticationJwtBearer(
    s =>
    {
        s.SigningKey = jwtSecret;
    },
    b =>
    {
        b.TokenValidationParameters.ValidIssuer = jwtIssuer;
        b.TokenValidationParameters.ValidAudience = jwtAudience;
        b.TokenValidationParameters.ValidateLifetime = true;
        b.TokenValidationParameters.ClockSkew = TimeSpan.Zero;
    }
);
builder.Services.Configure<JwtCreationOptions>(o =>
{
    o.SigningKey = jwtSecret;
    o.Issuer = jwtIssuer;
    o.Audience = jwtAudience;
});
builder.Services.AddAuthorization();

builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument();

var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
            ?? throw new ArgumentNullException("Environment CORS_ALLOWED_ORIGINS not found");
builder.Services.AddCors(o => 
    o.AddPolicy("cors", p => 
        p.WithOrigins(allowedOrigins.Split(',')).AllowAnyHeader().AllowAnyMethod())
);

var app = builder.Build();

app.UseCors("cors");

//app.UseHttpsRedirection();

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

#if !DEBUG
app.UseSpaStaticFiles();
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "client";
});
#endif

var initializer = app.Services.GetRequiredService<DatabaseInitializer>();
await initializer.InitializeAsync();

app.Run();