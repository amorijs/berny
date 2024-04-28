import Image from 'next/image'

export async function Landing() {
  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="md:col-span-1">
            <h1 className="mb-4 text-4xl font-bold">Berny</h1>
            <p className="mb-6">
              Stop giving away your email. Let Berny handle it for you.
            </p>
          </div>
          <div className="md:col-span-1">
            <Image
              width={500}
              height={500}
              src="/berny-transparentfull.png"
              alt="Illustration"
              className="h-auto w-full"
            />
          </div>
        </div>
      </main>

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
