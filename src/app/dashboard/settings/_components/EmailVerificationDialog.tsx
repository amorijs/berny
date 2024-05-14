'use client'

import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '~/components/ui/input-otp'
import { toast } from '~/components/ui/use-toast'
import { api } from '~/trpc/react'

type EmailVerificationDialogProps = {
  open: boolean
  newEmail: string
  verificationId?: string
  onClose: () => void
}

export const EmailVerificationDialog = ({
  open,
  newEmail,
  verificationId,
  onClose,
}: EmailVerificationDialogProps) => {
  const [value, setValue] = useState('')
  const [debouncedValue] = useDebounce(value, 500)

  const apiUtils = api.useUtils()

  const {
    mutate: completeEmailVerification,
    isPending: isPendingCompleteEmailVerification,
    error,
  } = api.user.completeEmailVerification.useMutation({
    onSuccess: async (newEmail) => {
      toast({
        title: 'Email updated!',
        description: <div>{newEmail}</div>,
      })
      setValue('')
      await apiUtils.user.invalidate()
      onClose()
    },
  })

  useEffect(() => {
    if (!verificationId || debouncedValue.length !== 6) {
      return
    }

    completeEmailVerification({
      otp: debouncedValue,
      verificationId,
    })
  }, [verificationId, debouncedValue, completeEmailVerification])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Email</DialogTitle>
          <div className="hidden text-sm text-muted-foreground md:inline">
            We&apos;ve sent a verification code to <strong>{newEmail}</strong>,
            please enter it below.
          </div>
        </DialogHeader>
        <div className="flex gap-5">
          <InputOTP
            maxLength={6}
            minLength={6}
            value={value}
            onChange={setValue}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {isPendingCompleteEmailVerification && (
            <ClipLoader
              className="ml-5 "
              size={25}
              loading={isPendingCompleteEmailVerification}
              color="#ea580c"
            />
          )}
          {error && <div className="text-red-500">{error.message}</div>}
        </div>
        {/* <div className="flex gap-3">
          <Button
            disabled={isPendingCompleteEmailVerification}
            onClick={async () => {
              //   onEmailVerificationSubmit(watchedOtp)
            }}
          >
            Submit
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  )
}
