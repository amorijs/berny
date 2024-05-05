import * as edgedb from 'edgedb'
import queryBuilder from '../../../dbschema/edgeql-js'

export const client = edgedb.createClient({
  instanceName: process.env.EDGEDB_INSTANCE,
  secretKey: process.env.EDGEDB_SECRET_KEY,
  database: 'main',
})
export const qb = queryBuilder
