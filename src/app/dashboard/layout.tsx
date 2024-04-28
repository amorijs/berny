'use client'

import Image from 'next/image'
import { SidebarNav } from './_components/SidebarNav'
import { Separator } from '~/components/ui/separator'
import { usePathname, redirect } from 'next/navigation'

const sidebarNavItems = [
  {
    title: 'Inboxes',
    href: '/dashboard/inboxes',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
  },
]

export default function DashboardHome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (pathname === '/dashboard') {
    redirect('/dashboard/inboxes')
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className=" flex  w-full justify-between pb-5 pt-5">
        <div className="flex items-center">
          <Image
            className="cursor-pointer rounded-full"
            src="/bernielogo_darkouttranspin.png"
            width={75}
            height={75}
            alt="bernylogo"
          />
        </div>
      </div>
      <Separator />
      <div>
        <div className="pt-10">
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
