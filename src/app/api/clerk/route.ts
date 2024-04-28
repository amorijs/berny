import { type WebhookEvent } from '@clerk/nextjs/server'
import { api } from '~/trpc/server'

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload: WebhookEvent = await request.json()

  console.log({ payload })
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
