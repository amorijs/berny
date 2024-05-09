/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { api } from '~/trpc/react'

// type Config = {
//   selected: MailType['id'] | null
//   data: GetMailForInboxType | null
//   isLoading: boolean
//   error: unknown
// }

export const selectedAtom = atom<string | null>(null)

export function useMail(inboxId: string | undefined) {
  const [selected, setSelected] = useAtom(selectedAtom)

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
