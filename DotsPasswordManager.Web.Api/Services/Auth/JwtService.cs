using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using FastEndpoints.Security;
using Microsoft.IdentityModel.Tokens;

namespace DotsPasswordManager.Web.Api.Services.Auth;

public class JwtService : IJwtService
{
    private readonly int _jwtExpirationMinutes;

    public JwtService(IConfiguration configuration)
    {
        _jwtExpirationMinutes = int.Parse(configuration["Jwt:ExpirationMinutes"]!);
    }

    public string GenerateJwt(DB.User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.OriginalUsername),
            new Claim(ClaimTypes.Role, "User"), // Puoi aggiungere ruoli o altri claim
        };

        return JwtBearer.CreateToken(o =>
        {
            o.ExpireAt = DateTime.UtcNow.AddSeconds(_jwtExpirationMinutes);
            o.User.Claims.AddRange(claims);
        });
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }
}
