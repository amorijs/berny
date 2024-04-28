import { type InferSelectModel } from 'drizzle-orm'
import {
  type DomainsTable,
  type UsersTable,
  type InboxesTable,
} from './server/db/schema'

export type UserType = InferSelectModel<typeof UsersTable>
export type InboxType = InferSelectModel<typeof InboxesTable>
export type DomainType = InferSelectModel<typeof DomainsTable>
