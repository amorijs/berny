import '~/styles/globals.css'

import { Inter } from 'next/font/google'

import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { TRPCReactProvider } from '~/trpc/react'
import { ThemeProvider } from '~/components/ui/themeProvider'
import { cn } from '~/lib/utils'
import { Toaster } from '~/components/ui/toaster'
import Image from 'next/image'
import { Separator } from '~/components/ui/separator'
import { Landing } from './_components/Landing'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Berny',
  description: 'Stop giving away your email.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            `font-sans ${inter.variable}`,
            'flex h-screen w-screen flex-col items-center pt-10'
          )}
        >
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <div className="min-h-screen w-full max-w-7xl">
                <header className="flex justify-end">
                  <nav className="ml-5 flex w-full items-center space-x-4">
                    <div className=" flex  w-full justify-between pb-5 pt-5">
                      <div className="flex items-center">
                        <a href="/">
                          <Image
                            className="mr-auto cursor-pointer rounded-full"
                            src="/bernielogo_darkouttranspin.png"
                            width={75}
                            height={75}
                            alt="bernylogo"
                          />
                        </a>
                      </div>
                    </div>

                    <SignedIn>
                      <UserButton />
                      <a
                        href="/dashboard"
                        className="font-semibold text-primary-foreground"
                      >
                        Dashboard
                      </a>
                      <SignOutButton>
                        <a
                          className="min-w-[4rem] font-semibold text-primary-foreground"
                          href="#"
                        >
                          Sign Out
                        </a>
                      </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton>
                        <a
                          className="min-w-[4rem] font-semibold text-primary-foreground"
                          href="#"
                        >
                          Sign In
                        </a>
                      </SignInButton>
                    </SignedOut>
                  </nav>
                </header>
                <Separator />
                <SignedOut>
                  <Landing />
                </SignedOut>
                <SignedIn>{children}</SignedIn>
              </div>
              {/* <header className="">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
              </header> */}
              {/* <SignedIn>
                <div className="min-h-screen w-full max-w-7xl">
                  <header className="flex justify-end">
                    <UserButton />
                    <nav className="ml-5 flex items-center space-x-4">
                      <a
                        href="/dashboard/settings"
                        className="font-semibold text-primary-foreground"
                      >
                        Settings
                      </a>
                      <SignOutButton>
                        <a
                          className="font-semibold text-primary-foreground"
                          href="#"
                        >
                          Sign Out
                        </a>
                      </SignOutButton>
                    </nav>
                  </header>
                  {children}
                </div>
              </SignedIn> */}
            </ThemeProvider>
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
