import { Card } from '~/components/ui/card'

export default async function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Card className="p-5">{children}</Card>
    </div>
  )
}
