import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from 'lucide-react'
import { Letter } from 'react-letter'

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Label } from '~/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { addDays, addHours, format, nextSaturday } from 'date-fns'
import { type MailType } from '~/server/api/routers/inbox/types'
import { api } from '~/trpc/react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormMessage } from '~/components/ui/form'
import { toast } from '~/components/ui/use-toast'

interface MailDisplayProps {
  mailId: string | null
}

const FormSchema = z.object({
  body: z.string().min(1, {
    message: 'Must be at least 1 character.',
  }),
})

export function MailDisplay({ mailId }: MailDisplayProps) {
  const today = new Date()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      body: '',
    },
  })

  const {
    data: mail,
    isLoading,
    error,
  } = api.inbox.getMail.useQuery(
    { mailId: mailId ?? '' },
    { enabled: !!mailId?.length }
  )

  console.log({ mail })

  const { mutate, isPending } = api.inbox.replyToMail.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Email sent!',
        description: <div>{data?.to?.[0]}</div>,
      })

      form.reset()
    },
    onError: async (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to send email',
        description: error.message,
      })
    },
  })

  // const sanitizedBody = useMemo(() => {
  //   return extract
  // }, [mail?.body])

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!mailId || !mail?.inboxId) {
      return
    }

    mutate({ mailId, body: data.body, mailslurpInboxId: mail.inboxId })
  }

  const mailLoaded = !!mail && !isLoading && !error

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Later today{' '}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), 'E, h:m b')}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Tomorrow
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), 'E, h:m b')}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      This weekend
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), 'E, h:m b')}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                    >
                      Next week
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), 'E, h:m b')}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailLoaded}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mailLoaded}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail?.from ?? undefined} />
                <AvatarFallback>
                  {mail.from
                    ?.split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.from}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.from}
                </div>
              </div>
            </div>
            {mail.createdAt && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.createdAt), 'PPpp')}
              </div>
            )}
          </div>
          <Separator />
          {/* <div
            className="flex-1 whitespace-pre-wrap p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: mail.body ?? '' }}
          >
          </div> */}
          {mail.body && <Letter html={mail.body} />}
          <Separator className="mt-auto" />
          <div className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <div className="grid gap-4">
                      <FormControl>
                        <Textarea
                          className="p-4"
                          placeholder={`Reply...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="flex items-center">
                        <Label
                          htmlFor="mute"
                          className="flex items-center gap-2 text-xs font-normal"
                        >
                          <Switch id="mute" aria-label="Mute thread" /> Mute
                          this thread
                        </Label>
                        <Button
                          disabled={isPending || !mailLoaded}
                          size="sm"
                          className="ml-auto"
                          type="submit"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
