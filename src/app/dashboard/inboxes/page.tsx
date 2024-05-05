'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { useState } from 'react'
import { api } from '~/trpc/react'
import { ClipLoader } from 'react-spinners'
import { useDebounce } from 'use-debounce'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '~/components/ui/use-toast'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

const FormSchema = z.object({
  website: z.string().min(5, {
    message: 'Must be at least 5 characters.',
  }),
})

export default function Inboxes() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [addNew, setAddNew] = useState(false)
  const [inboxToDelete, setInboxToDelete] = useState<{
    id: string
    email: string
  } | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      website: '',
    },
  })

  const { data: inboxes, isLoading } = api.inbox.inboxes.useQuery({
    search: debouncedSearch,
  })

  const utils = api.useUtils()

  const { isPending: creatingInbox, mutate: createInbox } =
    api.inbox.create.useMutation({
      onSuccess: async (email) => {
        form.reset()
        setAddNew(false)

        toast({
          title: 'Inbox created!',
          description: <div>{email}</div>,
        })

        await utils.inbox.inboxes.invalidate()
      },

      onError: async (error) => {
        toast({
          variant: 'destructive',
          title: 'Failed to create inbox',
          description: error.message,
        })
      },
    })

  const { isPending: deletingInbox, mutate: deleteInbox } =
    api.inbox.delete.useMutation({
      onSuccess: async () => {
        setInboxToDelete(null)
        await utils.inbox.inboxes.invalidate()
      },

      onError: async (error) => {
        toast({
          variant: 'destructive',
          title: 'Failed to delete inbox',
          description: error.message,
        })
      },
    })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    createInbox({ domain: data.website })
  }

  return (
    <>
      <Dialog open={addNew} onOpenChange={(isOpen) => setAddNew(isOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new inbox</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-2/3 space-y-6"
            >
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="ie berny.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      What website did you give this email to?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={creatingInbox} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!inboxToDelete}
        onOpenChange={() => setInboxToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inbox</DialogTitle>
            <div className="hidden text-sm text-muted-foreground md:inline">
              {inboxToDelete?.email}
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-5">
            <Button variant="outline" onClick={() => setInboxToDelete(null)}>
              Cancel
            </Button>
            <Button
              disabled={deletingInbox}
              onClick={async () => {
                deleteInbox({ id: inboxToDelete!.id })
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="max-w-[1500px]">
        <CardHeader>
          <CardTitle>Inboxes</CardTitle>
          <CardDescription>Manage your inboxes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center">
            <Input
              type="search"
              placeholder="Search..."
              className="md:w-[100px] lg:w-[300px]"
              onChange={(e) => setSearch(e.target.value)}
            />
            <ClipLoader
              className="ml-5 "
              size={25}
              loading={isLoading}
              color="#ea580c"
            />
            <Button className="ml-5" onClick={() => setAddNew(true)}>
              Create New Inbox
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Domain</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inboxes?.map((inbox) => (
                <TableRow className="cursor-pointer" key={inbox.id}>
                  <TableCell className="hidden md:table-cell">
                    {inbox.domains[0]?.name}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inbox?.email}</div>
                    {/* <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div> */}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant="secondary">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {inbox.createdAt.toDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setInboxToDelete(inbox)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
