import { type Config } from 'drizzle-kit'

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required')
}

export default {
  schema: './src/server/db/schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config
