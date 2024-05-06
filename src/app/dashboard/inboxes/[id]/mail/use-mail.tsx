/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { atom, useAtom } from 'jotai'

import { type Mail, mails } from './data'

type Config = {
  selected: Mail['id'] | null
}

const configAtom = atom<Config>({
  selected: mails[0]?.id ?? '',
})

export function useMail() {
  return useAtom(configAtom)
}
