import { type WebhookEvent } from '@clerk/nextjs/server'
import { client, qb } from '~/server/db/edge'

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload: WebhookEvent = await request.json()

  if (payload.type === 'user.created') {
    await qb
      .insert(qb.User, {
        clerkId: payload.data.id,
        email: payload.data.email_addresses[0]?.email_address ?? 'UNSET',
      })
      .run(client)
  }

  return Response.json({ message: 'OK' })
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
