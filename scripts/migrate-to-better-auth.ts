/**
 * One-time data migration: backfill existing users into Better Auth's `account` table.
 *
 * Better Auth stores credentials in `account` (with providerId='credential').
 * Existing users have passwordHash + passwordSalt on the `users` table.
 * We encode them as `${hash}:${salt}` — the same format our custom password.verify expects.
 *
 * Also backfills the `name` column (= originalUsername) and sets defaults for
 * the new BA columns added to `users`.
 *
 * Run once after applying the drizzle migration:
 *   bun run scripts/migrate-to-better-auth.ts
 */
import 'dotenv/config'
import { randomUUID } from 'node:crypto'

import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../src/lib/server/db/schema.ts'

function buildDatabaseUrl(): string {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL

    const protocol = process.env.DATABASE_PROTOCOL ?? 'postgresql'
    const host = process.env.DATABASE_HOST
    const port = process.env.DATABASE_PORT
    const database = process.env.DATABASE_NAME
    const username = process.env.DATABASE_USER
    const password = process.env.DATABASE_PASSWORD

    if (!host || !port || !database || !username || !password) {
        throw new Error('Missing DATABASE_* env vars')
    }
    return `${protocol}://${username}:${password}@${host}:${port}/${database}`
}

const dburl = buildDatabaseUrl()
console.log('Connecting to database...', dburl)
const db = drizzle(dburl, { schema })

async function main() {
    console.log('Starting Better Auth migration...')

    // 1. Backfill users.name from originalUsername where name is empty
    const usersWithoutName = await db
        .select({ id: schema.users.id, originalUsername: schema.users.originalUsername })
        .from(schema.users)
        .where(eq(schema.users.name, ''))

    if (usersWithoutName.length > 0) {
        console.log(`Backfilling name for ${usersWithoutName.length} users...`)
        for (const user of usersWithoutName) {
            await db
                .update(schema.users)
                .set({ name: user.originalUsername })
                .where(eq(schema.users.id, user.id))
        }
        console.log('  → done')
    } else {
        console.log('All users already have name set.')
    }

    // 2. Create account rows for users that don't yet have a credential account
    const allUsers = await db
        .select({
            id: schema.users.id,
            passwordHash: schema.users.passwordHash,
            passwordSalt: schema.users.passwordSalt,
        })
        .from(schema.users)

    let created = 0
    for (const user of allUsers) {
        const existing = await db
            .select({ id: schema.account.id })
            .from(schema.account)
            .where(
                and(
                    eq(schema.account.userId, user.id),
                    eq(schema.account.providerId, 'credential'),
                ),
            )
            .limit(1)

        if (existing.length > 0) continue

        // Skip users with empty legacy password (created after BA migration)
        if (!user.passwordHash || !user.passwordSalt) continue

        await db.insert(schema.account).values({
            id: randomUUID(),
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            // BA custom verify reads this as "hash:salt"
            password: `${user.passwordHash}:${user.passwordSalt}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        created++
    }

    console.log(`Created ${created} account rows for existing users.`)
    console.log('Migration complete.')
    process.exit(0)
}

main().catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
})
