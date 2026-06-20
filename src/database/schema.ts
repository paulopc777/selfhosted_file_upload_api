import { integer, pgTable, varchar, text, bigint } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const rolesEnum = ['admin', 'user'] as const

export const usersTable = pgTable('users', {
    id: text()
        .$defaultFn(() => createId())
        .primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 255 }).notNull().default('user'),
})

export const bucketsTable = pgTable('buckets', {
    id: text()
        .$defaultFn(() => createId())
        .primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    user_id: text()
        .notNull()
        .references(() => usersTable.id),
})

export const filesTable = pgTable('files', {
    id: text()
        .$defaultFn(() => createId())
        .primaryKey(),
    name: varchar({ length: 255 }),
    bucket_id: text()
        .notNull()
        .references(() => bucketsTable.id),
    user_id: text().references(() => usersTable.id),
    size: integer(),
    type: varchar({ length: 255 }).notNull(),
    created_at: integer()
        .notNull()
        .default(Math.floor(Date.now() / 1000)),
    last_accessed_at: integer()
        .notNull()
        .default(Math.floor(Date.now() / 1000)),
    sha256: varchar({ length: 255 }).notNull(),
    referer: varchar({ length: 255 }),
})
