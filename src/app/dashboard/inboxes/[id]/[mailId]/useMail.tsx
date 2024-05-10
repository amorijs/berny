import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { api } from '~/trpc/react'

export function useMail(inboxId: string | undefined | null) {
  const router = useRouter()
  const params = useParams()
  const selected = Array.isArray(params.mailId)
    ? params.mailId[0]
    : params.mailId

  const setSelected = (id: string) => {
    router.push(`/dashboard/inboxes/${inboxId}/${id}`)
  }

  const { data, isLoading, error } = api.inbox.getMailForInbox.useQuery(
    { inboxId: inboxId ?? '' },
    { enabled: !!inboxId, refetchInterval: 5000 }
  )

  const { mutate: markAsRead } = api.inbox.markAsRead.useMutation()

  useEffect(() => {
    console.log('rerender....', selected)
    if (selected) {
      markAsRead({ mailId: selected })
    }
  }, [selected, markAsRead])

  return {
    data,
    isLoading,
    selected,
    error,
    setSelected,
  }
}
