'use client'

import { useSession } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { toast } from '~/components/ui/use-toast'
import { api } from '~/trpc/react'

const FormSchema = z.object({
  email: z.string().min(3, {
    message: 'Must be at least 3 characters.',
  }),
})

export default function Settings() {
  const [lockEmail, setLockEmail] = useState(false)

  const session = useSession()
  console.log({ session })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  })

  const { data: user, isLoading, error } = api.user.get.useQuery()

  const { mutateAsync, isPending } = api.user.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Email updated!',
        description: <div>{data?.[0]?.email}</div>,
      })
    },
  })

  const apiUtils = api.useUtils()

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    await mutateAsync({ email: data.email })
    await apiUtils.user.get.invalidate()
    setLockEmail(false)
  }

  useEffect(() => {
    if (user?.[0]?.email && !lockEmail) {
      form.setValue('email', user[0].email)
      setLockEmail(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const isSubmitDisabled =
    isPending || form.getValues('email') === user?.[0]?.email

  return (
    <Card>
      <CardHeader title="Settings" />
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              disabled={isPending || isLoading || !user || !!error}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Write your main email address here"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What email should we forward all incoming emails to?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitDisabled} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}