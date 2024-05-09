'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'

const config = {
  dashboard: { name: 'Dashboard', href: '/dashboard' },
  home: { name: 'Home', href: '/dashboard/home' },
  inboxes: { name: 'Inboxes', href: '/dashboard/inboxes' },
  analytics: { name: 'Analytics', href: '/dashboard/analytics' },
  settings: { name: 'Settings', href: '/dashboard/settings' },
}

export default function DashboardBreadcrumbs() {
  const pathname = usePathname()

  const items = pathname
    .split('/')
    .map((path) => config[path as keyof typeof config])
    .filter((el) => el)

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={item.name}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}

        {/* <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="#">Inboxes</Link>
          </BreadcrumbLink>
        </BreadcrumbItem> */}
        {/* <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recent Orders</BreadcrumbPage>
          </BreadcrumbItem> */}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
