import '~/styles/globals.css'

import { Inter } from 'next/font/google'

import { ClerkProvider, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { TRPCReactProvider } from '~/trpc/react'
import { ThemeProvider } from '~/components/ui/themeProvider'
import { cn } from '~/lib/utils'
import { Toaster } from '~/components/ui/toaster'
import { Separator } from '~/components/ui/separator'
import { Landing } from './_components/Landing'
import { TooltipProvider } from '~/components/ui/tooltip'

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
            'flex h-screen w-screen flex-col items-center overflow-hidden'
          )}
        >
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <>
                <SignedOut>
                  <header className="flex justify-end">
                    <nav className="ml-5 flex w-full items-center space-x-4">
                      <SignInButton>
                        <a
                          className="min-w-[4rem] font-semibold text-primary-foreground"
                          href="#"
                        >
                          Sign In
                        </a>
                      </SignInButton>
                    </nav>
                  </header>
                </SignedOut>
                <Separator />
                <SignedOut>
                  <Landing />
                </SignedOut>
                <SignedIn>
                  <TooltipProvider>{children}</TooltipProvider>
                </SignedIn>
              </>
            </ThemeProvider>
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
