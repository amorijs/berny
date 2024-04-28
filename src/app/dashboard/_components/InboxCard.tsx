import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { type InboxType } from '~/types'

export const InboxCard = ({
  inbox,
  domain,
}: {
  inbox: InboxType
  domain: string
}) => {
  return (
    <Card
      className="flex cursor-pointer items-center justify-between p-2 hover:border-primary"
      key={inbox.id}
    >
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-lg">{inbox.email}</CardTitle>
        <CardDescription>{domain}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>{inbox.created_at.toDateString()}</div>
      </CardContent>
    </Card>
  )
}
