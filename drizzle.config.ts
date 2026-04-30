import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ['.env.local', '.env'] })

const normalizeEnvValue = (value: string | undefined) => {
    if (!value) return value

    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1)
    }

    return value
}

const buildDatabaseUrl = () => {
    if (process.env.DATABASE_URL) {
        return normalizeEnvValue(process.env.DATABASE_URL)!
    }

    const protocol = normalizeEnvValue(process.env.DATABASE_PROTOCOL) ?? 'postgresql'
    const host = normalizeEnvValue(process.env.DATABASE_HOST)
    const port = normalizeEnvValue(process.env.DATABASE_PORT)
    const database = normalizeEnvValue(process.env.DATABASE_NAME)
    const username = normalizeEnvValue(process.env.DATABASE_USER)
    const password = normalizeEnvValue(process.env.DATABASE_PASSWORD)

    if (!host || !port || !database || !username || !password) {
        throw new Error(
            'Missing DB env vars. Provide DATABASE_URL or DATABASE_PROTOCOL, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD.',
        )
    }

    const encodedUser = username
    const encodedPassword = encodeURIComponent(password)
    const sslMode = normalizeEnvValue(process.env.DATABASE_SSLMODE)
    const query = sslMode ? `?sslmode=${encodeURIComponent(sslMode)}` : ''

    return `${protocol}://${encodedUser}:${encodedPassword}@${host}:${port}/${database}${query}`
}

export default defineConfig({
    out: './drizzle',
    schema: './src/lib/server/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: buildDatabaseUrl(),
    },
})
