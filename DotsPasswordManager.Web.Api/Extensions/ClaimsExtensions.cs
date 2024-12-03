using System.Security.Claims;

namespace DotsPasswordManager.Web.Api.Extensions;

public static class ClaimsExtensions
{
    public static Guid? GetUserId(this IEnumerable<Claim> claims)
    {
        var uid = claims.FirstOrDefault(k => k.Type == ClaimTypes.NameIdentifier)?.Value?.ToString();
        if (uid == null) return null;
        return new Guid(uid);
    }
}
