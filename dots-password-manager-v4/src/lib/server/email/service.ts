import sgMail from '@sendgrid/mail'

import passwordResetRequestTemplateRaw from './templates/password-reset-request.html?raw'
import passwordResettedTemplateRaw from './templates/password-resetted.html?raw'
import welcomeTemplateRaw from './templates/welcome.html?raw'

type MailUser = {
    email: string
    originalUsername: string
}

function readRequired(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

async function sendMail(options: {
    to: string
    toName: string
    subject: string
    html: string
}): Promise<void> {
    const apiKey = readRequired('SENDGRID_API_KEY')
    const fromAddress = readRequired('FROM_ADDRESS')

    sgMail.setApiKey(apiKey)

    await sgMail.send({
        from: { email: fromAddress, name: 'Dots Password Manager' },
        to: { email: options.to, name: options.toName },
        subject: options.subject,
        html: options.html,
    })
}

function welcomeTemplate(user: MailUser, webappHost: string): string {
    return welcomeTemplateRaw
        .replaceAll('[USER-EMAIL]', user.email)
        .replaceAll('[URL]', webappHost)
        .replaceAll('[WEBAPP_HOST]', webappHost)
}

function resetRequestTemplate(user: MailUser, resetUrl: string, webappHost: string): string {
    return passwordResetRequestTemplateRaw
        .replaceAll('[USER-EMAIL]', user.email)
        .replaceAll('[REQUEST_URL]', resetUrl)
        .replaceAll('[WEBAPP_HOST]', webappHost)
}

function passwordResettedTemplate(user: MailUser, webappHost: string): string {
    const now = new Date()
    const date = now.toLocaleDateString('en-GB', {
        timeZone: 'UTC',
    })
    const time = now.toISOString().slice(11, 19)

    return passwordResettedTemplateRaw
        .replaceAll('[USER-EMAIL]', user.email)
        .replaceAll('[URL]', webappHost)
        .replaceAll('[WEBAPP_HOST]', webappHost)
        .replaceAll('[Date]', date)
        .replaceAll('[Time]', time)
}

export async function sendWelcomeEmail(user: MailUser): Promise<void> {
    try {
        const webappHost = readRequired('WEBAPP_HOST')

        await sendMail({
            to: user.email,
            toName: user.originalUsername,
            subject: 'Welcome to Better Dots Password Manger!',
            html: welcomeTemplate(user, webappHost),
        })
    } catch {
        // Keep legacy behavior: welcome email failures do not block registration.
    }
}

export async function sendPasswordResetRequestEmail(
    user: MailUser,
    resetUrl: string,
): Promise<void> {
    const webappHost = readRequired('WEBAPP_HOST')

    await sendMail({
        to: user.email,
        toName: user.originalUsername,
        subject: 'Dots Password Manger - Password Reset',
        html: resetRequestTemplate(user, resetUrl, webappHost),
    })
}

export async function sendPasswordResettedEmail(user: MailUser): Promise<void> {
    try {
        const webappHost = readRequired('WEBAPP_HOST')

        await sendMail({
            to: user.email,
            toName: user.originalUsername,
            subject: 'Better Dots Password Manger - Password resetted',
            html: passwordResettedTemplate(user, webappHost),
        })
    } catch {
        // Keep legacy behavior: confirmation email failures do not block response.
    }
}
