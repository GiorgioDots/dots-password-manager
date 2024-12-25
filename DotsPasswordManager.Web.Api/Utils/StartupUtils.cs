using DotsPasswordManager.Web.Api.Features.User.SavedPassword._Services;
using DotsPasswordManager.Web.Api.Services.Auth;
using DotsPasswordManager.Web.Api.Services.Crypto;
using DotsPasswordManager.Web.Api.Services.Email;

namespace DotsPasswordManager.Web.Api.Utils;

public static class StartupUtils
{
    public static void AddServices(this IServiceCollection services, AppSettings appSettings)
    {
        var connStr = appSettings.DbConnectionString;
        services.AddSingleton(_ => new DatabaseInitializer(connStr));
        services.AddDbContextPool<DPMDbContext>(o => o.UseNpgsql(connStr));

        services.AddSingleton<IJwtService, JwtService>();
        services.AddSingleton<ClientCryptoService>();
        services.AddSingleton<EmailService>();
        services.AddScoped<CryptoService>();
        services.AddScoped<OptimizedCryptoService>();
        services.AddScoped<SavedPasswordMapper>();
    }
}
