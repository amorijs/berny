// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import {
  integer,
  pgTableCreator,
  serial,
  timestamp,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`)

export const UsersTable = createTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    clerk_id: text('clerk_id').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex('unique_idx').on(users.email),
      uniqueIndex: uniqueIndex('unique_index').on(users.clerk_id),
    }
  }
)

export const ProxiesTable = createTable('proxies', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  user_id: integer('user_id')
    .references(() => UsersTable.id)
    .notNull(),
  inbox_id: text('inbox_id').notNull(),
  icon: text('icon'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const DomainsTable = createTable('domains', {
  id: serial('id').primaryKey(),
  domain: text('domain').notNull(),
  proxy_id: integer('proxy_id')
    .references(() => ProxiesTable.id)
    .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})
