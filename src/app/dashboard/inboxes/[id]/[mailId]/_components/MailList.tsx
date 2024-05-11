import { formatDistanceToNow } from 'date-fns'

import { ScrollArea } from '~/components/ui/scroll-area'
import { useMail } from '../useMail'
import { cn } from '~/lib/utils'
import { type MailType } from '~/server/api/routers/inbox/types'

interface MailListProps {
  inboxId: string | undefined | null
  items: MailType[]
}

export function MailList({ inboxId, items }: MailListProps) {
  const { selected, setSelected } = useMail(inboxId)

  console.log({ items })

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              selected === item.id && 'bg-muted'
            )}
            onClick={() => setSelected(item.id)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.from}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    selected === item.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {formatDistanceToNow(item.createdAt, {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            {/* <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div> */}
            {/* {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null} */}
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}

// function getBadgeVariantFromLabel(
//   label: string
// ): ComponentProps<typeof Badge>['variant'] {
//   if (['work'].includes(label.toLowerCase())) {
//     return 'default'
//   }

//   if (['personal'].includes(label.toLowerCase())) {
//     return 'outline'
//   }

//   return 'secondary'
// }
