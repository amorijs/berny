import Link from 'next/link'

export default async function LandingPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Link
        className="text-primary-foreground underline"
        href="/dashboard/inboxes"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
