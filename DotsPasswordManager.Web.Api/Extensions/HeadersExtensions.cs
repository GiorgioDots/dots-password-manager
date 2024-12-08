namespace DotsPasswordManager.Web.Api.Extensions;

public static class HeadersExtensions
{
    public static string? GetPublicKey(this IHeaderDictionary head)
    {
        head.TryGetValue("x-public-key", out var res);
        return res;
    }
}
