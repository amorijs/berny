import Image from 'next/image'
import { SidebarNav } from './_components/SidebarNav'
import { Separator } from '~/components/ui/separator'

const sidebarNavItems = [
  {
    title: 'Inboxes',
    href: '/dashboard/inboxes',
  },
  {
    title: 'Templates',
    href: '/dashboard/templates',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <header className="w-full pb-5 pt-5">
        <div className="flex w-full justify-between">
          <div className="flex items-center">
            <Image
              className="cursor-pointer rounded-full"
              src="/bernielogo_darkouttranspin.png"
              width={75}
              height={75}
              alt="bernylogo"
            />
          </div>
          <nav className="ml-auto flex items-center space-x-4">
            <a
              href="/settings"
              className="font-semibold text-primary-foreground"
            >
              Settings
            </a>
            <a href="/logout" className="font-semibold text-primary-foreground">
              Logout
            </a>
          </nav>
        </div>
      </header>
      <Separator />
      <div className="pt-10">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
    //   <html lang="en">
    //     <body className={`font-sans ${inter.variable}`}>
    //       <TRPCReactProvider>{children}</TRPCReactProvider>
    //     </body>
    //   </html>
  )
}
