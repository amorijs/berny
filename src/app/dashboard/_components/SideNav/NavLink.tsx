'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

export function NavLink({
  icon,
  href,
  title,
}: {
  icon: React.ReactNode
  href: string
  title: string
}) {
  const pathname = usePathname()

  const sharedClasses =
    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8'
  const activeClasses = 'bg-accent text-accent-foreground'
  const inactiveClasses = 'text-muted-foreground'

  const className = cn(
    sharedClasses,
    pathname === href ? activeClasses : inactiveClasses
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} className={className}>
          {icon}
          <span className="sr-only">{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  )
}
