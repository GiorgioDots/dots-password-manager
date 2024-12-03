namespace DotsPasswordManager.Web.Api.Services.Auth;

public interface IJwtService
{
    string GenerateJwt(RegisteredUser user);
    string GenerateRefreshToken();
}
