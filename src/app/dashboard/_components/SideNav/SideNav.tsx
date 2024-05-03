import Link from 'next/link'
import { Home, LineChart, Mails, Settings, UserCheck } from 'lucide-react'

import { NavLink } from './NavLink'

export async function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <UserCheck className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Berny</span>
        </Link>
        <NavLink
          href="/dashboard"
          icon={<Home className="h-5 w-5" />}
          title="Dashboard"
        />
        <NavLink
          href="/dashboard/inboxes"
          icon={<Mails className="h-5 w-5" />}
          title="Inboxes"
        />
        <NavLink
          href="/dashboard/analytics"
          icon={<LineChart className="h-5 w-5" />}
          title="Analytics"
        />
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavLink
          href="/dashboard/settings"
          icon={<Settings className="h-5 w-5" />}
          title="Settings"
        />
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip> */}
      </nav>
    </aside>
  )
}
