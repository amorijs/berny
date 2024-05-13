import { api } from '~/trpc/react'

export const useInbox = (inboxId?: string) => {
  const {
    data: inbox,
    error,
    isLoading,
  } = api.inbox.getInbox.useQuery({ id: inboxId ?? '' }, { enabled: !!inboxId })
  return { inbox, error, isLoading }
}
