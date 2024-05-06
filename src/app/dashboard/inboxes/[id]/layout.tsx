import { Card } from '~/components/ui/card'

export default async function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Card className="h-full max-h-full p-5">{children}</Card>
}
