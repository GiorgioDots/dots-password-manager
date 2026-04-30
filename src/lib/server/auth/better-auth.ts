import { randomBytes } from 'node:crypto'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

import { db } from '#/lib/server/db'
import * as schema from '#/lib/server/db/schema'

function loadSecret(): string {
    const secret = process.env.BETTER_AUTH_SECRET ?? process.env.CRYPTO_BASE_64_KEY
    if (!secret) {
        throw new Error('BETTER_AUTH_SECRET env var is required')
    }
    return secret
}

export const auth = betterAuth({
    baseURL: process.env.WEBAPP_HOST ?? 'http://localhost:3000',
    trustedOrigins: process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : process.env.WEBAPP_HOST
          ? [process.env.WEBAPP_HOST]
          : [],
    secret: loadSecret(),

    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            ...schema,
            // Map BA's 'user' model to our 'users' table
            user: schema.users,
        },
    }),

    advanced: {
        database: {
            // Use crypto.randomUUID for all table IDs (stored as UUID in PG)
            generateId: () =>
                randomBytes(16)
                    .toString('hex')
                    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'),
        },
    },

    emailAndPassword: {
        enabled: true,
        // Custom hash/verify to stay compatible with existing bcrypt-hashed passwords
        password: {
            hash: async (password) => {
                const { generatePasswordSalt, hashPasswordWithSalt } =
                    await import('#/lib/server/auth/password-hash')
                const salt = generatePasswordSalt()
                const hash = hashPasswordWithSalt(password, salt)
                // Store as "hash:salt" so we can separate them on verify
                return `${hash}:${salt}`
            },
            verify: async ({ hash: stored, password }) => {
                // Find the last `:` to split hash from salt (bcrypt hashes contain `$` not `:`)
                const colonIdx = stored.lastIndexOf(':')
                if (colonIdx === -1) return false
                const hash = stored.slice(0, colonIdx)
                const salt = stored.slice(colonIdx + 1)
                const { verifyPasswordWithSalt } = await import('#/lib/server/auth/password-hash')
                return verifyPasswordWithSalt(password, salt, hash)
            },
        },

        sendResetPassword: async ({ user, url }) => {
            const { sendPasswordResetRequestEmail } = await import('#/lib/server/email/service')
            void sendPasswordResetRequestEmail(
                { email: user.email, originalUsername: user.name },
                url,
            )
        },

        onPasswordReset: async ({ user }) => {
            const { sendPasswordResettedEmail } = await import('#/lib/server/email/service')
            void sendPasswordResettedEmail({ email: user.email, originalUsername: user.name })
        },
    },

    user: {
        modelName: 'users',
        additionalFields: {
            // Vault encryption salt — server-only, generated on user creation
            salt: {
                type: 'string',
                required: true,
                input: false,
            },
        },
    },

    // Generate vault salt before inserting a new user row
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const salt = randomBytes(16).toString('base64')
                    return {
                        data: {
                            ...user,
                            salt,
                            // Legacy columns — kept for backward compat, unused for new users
                            passwordHash: '',
                            passwordSalt: '',
                        },
                    }
                },
            },
        },
    },

    plugins: [
        username({
            minUsernameLength: 3,
            maxUsernameLength: 255,
            // Allow any character — we control validation in the form layer.
            // The default BA validator only allows [a-zA-Z0-9_.] which would
            // break existing users whose usernames contain other characters.
            usernameValidator: () => true,
            // Map BA's displayUsername to our originalUsername column
            schema: {
                user: {
                    fields: {
                        displayUsername: 'originalUsername',
                    },
                },
            },
        }),
    ],
})

export type Auth = typeof auth
