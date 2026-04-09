import {
    boolean,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    originalUsername: varchar('originalusername', { length: 255 }).notNull(),
    passwordHash: text('passwordhash').notNull(),
    salt: varchar('salt', { length: 255 }).notNull(),
    passwordSalt: text('passwordsalt').notNull(),
    createdAt: timestamp('createdat', { withTimezone: false }).defaultNow(),
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
