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

const FormSchema = z.object({
  website: z.string().min(5, {
    message: 'Must be at least 5 characters.',
  }),
})

export default function Inboxes() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [addNew, setAddNew] = useState(false)

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

  const { isPending, mutate } = api.inbox.create.useMutation({
    onSuccess: async (email) => {
      form.reset()
      setAddNew(false)

      toast({
        title: 'Inbox created!',
        description: <div>{email}</div>,
      })

      await utils.inbox.inboxes.invalidate()
    },
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    mutate({ domain: data.website })
  }

  return (
    <>
      <Card className="relative">
        <Button
          onClick={() => setAddNew(true)}
          className="absolute right-[1.5rem] top-[1.5rem]"
        >
          Create New Proxy
        </Button>
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
          </div>
          {inboxes?.map((inbox) => (
            <Card
              className="flex cursor-pointer items-center justify-between p-2 hover:border-primary"
              key={inbox!.id}
            >
              <CardHeader className="p-0">
                <CardTitle className="p-0 text-lg">{inbox!.email}</CardTitle>
                <CardDescription>{inbox!.domain.domain}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>{inbox!.created_at.toDateString()}</div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
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
              <Button disabled={isPending} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
