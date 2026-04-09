import nodemailer from 'nodemailer'
import { existsSync } from 'node:fs'
import path from 'node:path'

import passwordResetRequestTemplateRaw from './templates/password-reset-request.html?raw'
import passwordResettedTemplateRaw from './templates/password-resetted.html?raw'
import welcomeTemplateRaw from './templates/welcome.html?raw'

type MailUser = {
    email: string
    originalUsername: string
}

type SmtpConfig = {
    host: string
    port: number
    username: string
    password: string
    fromAddress: string
    webappHost: string
}

function readRequired(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

function getSmtpConfig(): SmtpConfig {
    return {
        host: readRequired('SMTP_HOST'),
        port: Number.parseInt(readRequired('SMTP_PORT'), 10),
        username: readRequired('SMTP_USERNAME'),
        password: readRequired('SMTP_PASSWORD'),
        fromAddress: readRequired('FROM_ADDRESS'),
        webappHost: process.env.WEBAPP_HOST ?? 'http://localhost:3000',
    }
}

async function sendMail(options: {
    to: string
    toName: string
    subject: string
    html: string
}): Promise<void> {
    const cfg = getSmtpConfig()

    const transport = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: true,
        auth: {
            user: cfg.username,
            pass: cfg.password,
        },
    })

    const logoPath = path.join(process.cwd(), 'public', 'dpm-logo.png')

    await transport.sendMail({
        from: `Dots Password Manager <${cfg.fromAddress}>`,
        to: `${options.toName} <${options.to}>`,
        subject: options.subject,
        html: options.html,
        attachments: existsSync(logoPath)
            ? [
                  {
                      filename: 'dpm-logo.png',
                      path: logoPath,
                      cid: 'logo',
                  },
              ]
            : undefined,
    })
}

function welcomeTemplate(user: MailUser, webappHost: string): string {
    return welcomeTemplateRaw.replaceAll('[USER-EMAIL]', user.email).replaceAll('[URL]', webappHost)
}

function resetRequestTemplate(user: MailUser, requestId: string, webappHost: string): string {
    const requestUrl = `${webappHost}/auth/reset-password?r=${requestId}`
    return passwordResetRequestTemplateRaw
        .replaceAll('[USER-EMAIL]', user.email)
        .replaceAll('[REQUEST_URL]', requestUrl)
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
        .replaceAll('[Date]', date)
        .replaceAll('[Time]', time)
}

export async function sendWelcomeEmail(user: MailUser): Promise<void> {
    try {
        const cfg = getSmtpConfig()

        await sendMail({
            to: user.email,
            toName: user.originalUsername,
            subject: 'Welcome to Better Dots Password Manger!',
            html: welcomeTemplate(user, cfg.webappHost),
        })
    } catch {
        // Keep legacy behavior: welcome email failures do not block registration.
    }
}

export async function sendPasswordResetRequestEmail(
    user: MailUser,
    requestId: string,
): Promise<void> {
    const cfg = getSmtpConfig()

    await sendMail({
        to: user.email,
        toName: user.originalUsername,
        subject: 'Dots Password Manger - Password Reset',
        html: resetRequestTemplate(user, requestId, cfg.webappHost),
    })
}

export async function sendPasswordResettedEmail(user: MailUser): Promise<void> {
    try {
        const cfg = getSmtpConfig()

        await sendMail({
            to: user.email,
            toName: user.originalUsername,
            subject: 'Better Dots Password Manger - Password resetted',
            html: passwordResettedTemplate(user, cfg.webappHost),
        })
    } catch {
        // Keep legacy behavior: confirmation email failures do not block response.
    }
}
