import Image from 'next/image'

export async function Landing() {
  return (
    <div className="p-20">
      <div>
        <h1 className="mb-4 text-4xl font-bold">Berny</h1>
        <p className="mb-6">
          Stop giving away your email. Let Berny handle it for you.
        </p>
        <p>
          Berny generates emails for you on the fly. All of these emails route
          back to your primary email.
        </p>
        <Image
          width={900}
          height={576}
          src="/emailexample2.png"
          alt="email-example"
        />
        <p className="mt-8">This landing page is awesome, I know.</p>
      </div>

      <footer className="py-4">
        <div className="container mx-auto px-4">
          <p className="text-center">
            &copy; {new Date().getFullYear()} Berny. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
