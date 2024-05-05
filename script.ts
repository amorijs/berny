import * as edgedb from 'edgedb'
import e from './dbschema/edgeql-js'

const client = edgedb.createClient()

async function main() {
  // result will be inferred based on the query
  //   const result = await e
  //     .select(e.Movie, () => ({
  //       title: true,
  //       actors: () => ({ name: true }),
  //       filter_single: { title: "Iron Man 2" },
  //     }))
  //     .run(client);

  const result = await e
    .select(e.User, () => ({
      id: true,
      email: true,
    }))
    .run(client)

  console.log(JSON.stringify(result, null, 2))
}

main()
  .then(() => console.log('Done'))
  .catch((err) => console.error(err))
