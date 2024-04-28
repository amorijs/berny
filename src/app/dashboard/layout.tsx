'use client'

import { SidebarNav } from './_components/SidebarNav'
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
