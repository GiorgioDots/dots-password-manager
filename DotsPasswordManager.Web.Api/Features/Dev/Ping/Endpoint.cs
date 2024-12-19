
namespace Dev.Ping;

internal sealed class Endpoint : EndpointWithoutRequest<string>
{
    public override void Configure()
    {
        Get("dev/ping");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await SendOkAsync("ponghi");
    }
}
