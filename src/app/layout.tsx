import '~/styles/globals.css'

import { Inter } from 'next/font/google'

import { TRPCReactProvider } from '~/trpc/react'
import { ThemeProvider } from '~/components/ui/themeProvider'
import { cn } from '~/lib/utils'
import { Toaster } from '~/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Create T3 App',
  description: 'Generated by create-t3-app',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          `font-sans ${inter.variable}`,
          'flex h-screen w-screen justify-center pt-10'
        )}
      >
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen w-full max-w-7xl">{children}</div>
          </ThemeProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  )
}
