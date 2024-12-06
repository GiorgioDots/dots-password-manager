namespace DotsPasswordManager.Web.Api.Services.Auth;

public interface IJwtService
{
    string GenerateJwt(DB.User user, string publicKey);
    string GenerateRefreshToken();
}
