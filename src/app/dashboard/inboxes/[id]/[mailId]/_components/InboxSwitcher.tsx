/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'

import * as React from 'react'
import { cn } from '~/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { api } from '~/trpc/react'
import { useDebounce } from 'use-debounce'
import { useRouter } from 'next/navigation'

type InboxSwitcherProps = {
  currentInbox?: { id: string; email: string; domains: { name: string }[] }
}

export function InboxSwitcher({ currentInbox }: InboxSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  const router = useRouter()

  const { data: inboxes = [] } = api.inbox.inboxes.useQuery({
    search: debouncedSearch,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          // aria-expanded={open}
          className="h-[50px] w-full text-xs"
        >
          {currentInbox && (
            <div className="flex flex-col">
              <div>{currentInbox.email}</div>
              <div className="text-muted-foreground">
                {currentInbox.domains[0]?.name ?? ''}
              </div>
            </div>
          )}
          <ChevronsUpDown className="ml-2 ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search inboxes..."
            onValueChange={(val) => setSearch(val)}
          />
          <CommandEmpty>No inboxes found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {inboxes.map((inbox) => (
                <CommandItem
                  key={inbox.id}
                  value={inbox.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    router.push(`/dashboard/inboxes/${currentValue}/mail`)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentInbox?.id === inbox.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {inbox.domains?.[0]?.name} - {inbox.email}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
