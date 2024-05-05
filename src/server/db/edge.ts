import * as edgedb from 'edgedb'
import queryBuilder from '../../../dbschema/edgeql-js'

export const client = edgedb.createClient()
export const qb = queryBuilder
