import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema.ts'

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const protocol = process.env.DATABASE_PROTOCOL ?? 'postgresql'
  const host = process.env.DATABASE_HOST
  const port = process.env.DATABASE_PORT
  const database = process.env.DATABASE_NAME
  const username = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (!host || !port || !database || !username || !password) {
    throw new Error(
      'Missing DB env vars. Provide DATABASE_URL or DATABASE_PROTOCOL, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD.',
    )
  }

  const encodedUser = username
  const encodedPassword = encodeURIComponent(password)
  const sslMode = process.env.DATABASE_SSLMODE
  const query = sslMode ? `?sslmode=${encodeURIComponent(sslMode)}` : ''

  return `${protocol}://${encodedUser}:${encodedPassword}@${host}:${port}/${database}${query}`
}

export const db = drizzle(buildDatabaseUrl(), { schema })
