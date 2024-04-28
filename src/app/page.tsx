import Link from 'next/link'

export default async function Home() {
  return (
    <div>
      <h1>Welcome to Berny!</h1>
      <Link className="underline" href="/dashboard">
        Go to Dashboard
      </Link>
    </div>
  )
}
