import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    // Better Auth core fields
    name: text('name').notNull().default(''),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('emailverified').notNull().default(false),
    image: text('image'),
    updatedAt: timestamp('updatedat', { withTimezone: false }),
    // App-specific fields
    username: varchar('username', { length: 255 }).notNull().unique(),
    originalUsername: varchar('originalusername', { length: 255 }).notNull(),
    passwordHash: text('passwordhash').notNull().default(''),
    salt: varchar('salt', { length: 255 }).notNull().default(''),
    passwordSalt: text('passwordsalt').notNull().default(''),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
})

// Better Auth session table
export const session = pgTable('session', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userid')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresat', { withTimezone: false }).notNull(),
    ipAddress: text('ipaddress'),
    userAgent: text('useragent'),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp('updatedat', { withTimezone: false }).defaultNow().notNull(),
})

// Better Auth account table (stores credentials per provider)
export const account = pgTable('account', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userid')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('accountid').notNull(),
    providerId: text('providerid').notNull(),
    accessToken: text('accesstoken'),
    refreshToken: text('refreshtoken'),
    idToken: text('idtoken'),
    accessTokenExpiresAt: timestamp('accesstokenexpiresat', { withTimezone: false }),
    refreshTokenExpiresAt: timestamp('refreshtokenexpiresat', { withTimezone: false }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp('updatedat', { withTimezone: false }).defaultNow().notNull(),
})

// Better Auth verification table (for password reset tokens etc.)
export const verification = pgTable('verification', {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresat', { withTimezone: false }).notNull(),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
    updatedAt: timestamp('updatedat', { withTimezone: false }).defaultNow(),
})

export const refreshTokens = pgTable('refreshtokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userid')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expiresat', { withTimezone: false }).notNull(),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
    revokedAt: timestamp('revokedat', { withTimezone: false }),
})

export const savedPasswords = pgTable('savedpasswords', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userid')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    login: varchar('login', { length: 255 }).notNull(),
    secondLogin: varchar('secondlogin', { length: 255 }),
    passwordHash: text('passwordhash').notNull(),
    isFavourite: boolean('isfavourite').notNull().default(true),
    url: text('url'),
    notes: text('notes'),
    tags: text('tags').array(),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
    updatedAt: timestamp('updatedat', { withTimezone: false }).defaultNow(),
})

export const userRequests = pgTable('userrequests', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userid')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    requestType: text('requesttype').notNull(),
    expiresAt: timestamp('expiresat', { withTimezone: false }).notNull(),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
})
