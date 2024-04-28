import { type WebhookEvent } from '@clerk/nextjs/server'
import { db } from '~/server/db'
import { UsersTable } from '~/server/db/schema'
import { api } from '~/trpc/server'

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload: WebhookEvent = await request.json()

  if (payload.type === 'user.created') {
    await db.insert(UsersTable).values({
      clerk_id: payload.data.id,
      email: payload.data.email_addresses[0]?.email_address ?? 'UNSET',
    })
  }

  return 'ok'
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
