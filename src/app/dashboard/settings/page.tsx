'use client'

import { useSession } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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
import { api } from '~/trpc/react'
import { EmailVerificationDialog } from './_components/EmailVerificationDialog'

const FormSchema = z.object({
  email: z.string().min(3, {
    message: 'Must be at least 3 characters.',
  }),
})

export default function Settings() {
  const [lockEmail, setLockEmail] = useState(false)
  const [verificationId, setVerificationId] = useState<string | null>(null)

  const session = useSession()
  console.log({ session })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  })

  const [watchedEmail] = form.watch(['email'])

  const { data: user, isLoading, error } = api.user.get.useQuery()

  const {
    mutate: startEmailVerification,
    isPending: isPendingStartEmailVerification,
  } = api.user.startEmailVerification.useMutation({
    onSuccess: (verificationId) => {
      setVerificationId(verificationId)
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    startEmailVerification({ newEmail: data.email })
    setLockEmail(false)
  }

  useEffect(() => {
    if (user?.email && !lockEmail) {
      form.setValue('email', user.email)
      setLockEmail(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const isSubmitDisabled =
    isPendingStartEmailVerification || watchedEmail === user?.email

  return (
    <Card>
      <EmailVerificationDialog
        open={!!verificationId}
        onClose={() => setVerificationId(null)}
        newEmail={watchedEmail}
        verificationId={verificationId ?? ''}
      />
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Berny your way.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              disabled={
                isPendingStartEmailVerification || isLoading || !user || !!error
              }
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
