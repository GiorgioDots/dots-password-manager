using MimeKit;
using MailKit.Net.Smtp;

namespace DotsPasswordManager.Web.Api.Services.Email;

public class EmailService
{
    private readonly string smtpServer = Environment.GetEnvironmentVariable("SMTP_HOST") 
        ?? throw new ArgumentNullException("SMTP_HOST env is not defined");
    private readonly string smtpUser = Environment.GetEnvironmentVariable("SMTP_USERNAME")
        ?? throw new ArgumentNullException("SMTP_USERNAME env is not defined");
    private readonly string smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD")
        ?? throw new ArgumentNullException("SMTP_PASSWORD env is not defined");
    private readonly string senderEmail = Environment.GetEnvironmentVariable("FROM_ADDRESS")
        ?? throw new ArgumentNullException("FROM_ADDRESS env is not defined");
    private readonly int port = 587;

    public EmailService()
    {
        var port = Environment.GetEnvironmentVariable("SMTP_PORT")
            ?? throw new ArgumentNullException("SMTP_PORT env is not defined");
        this.port = int.Parse(port);
    }

    public async Task SendWelcomEmail(DB.User user)
    {
        try
        {
            var basePath = Directory.GetCurrentDirectory();
            string templatePath = Path.Combine(basePath, "EmailTemplates", "welcome.html");
            string template = File.ReadAllText(templatePath);

            string imagePath = Path.Combine(basePath, "Media", "PWA.png");
            template = template.Replace("[USER-EMAIL]", user.Email);
            template = template.Replace("[URL]", Environment.GetEnvironmentVariable("WEBAPP_HOST"));

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Dots Password Manager", this.senderEmail));
            message.To.Add(new MailboxAddress(user.OriginalUsername, user.Email));
            message.Subject = "Welcome to Better Dots Password Manger!";

            var builder = new BodyBuilder();

            var image = builder.LinkedResources.Add(imagePath);
            image.ContentId = "logo";

            builder.HtmlBody = template;

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpServer, port, false);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        } catch { }
    }
}
