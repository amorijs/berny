import { sql } from 'drizzle-orm'
import MailSlurp, {
  type SendEmailOptions,
  type WebhookNewEmailPayload,
} from 'mailslurp-client'
import { db } from '~/server/db'
import { DomainsTable, InboxesTable, UsersTable } from '~/server/db/schema'

const mailslurp = new MailSlurp({
  apiKey: process.env.MAIL_SLURP_API_KEY!,
})

const headerHtml = (emailFrom: string, domains: string[]) => {
  let domainsString = ''

  if (domains.length <= 2) {
    domainsString = domains.join(', ')
  } else {
    const first2 = domains.slice(0, 2)
    domains.push(`+${domains.length - 2} more`)
    domainsString = [...first2, `+${domains.length - 2} more`].join(', ')
  }

  return `
      <div style="background-color: #f8f9fa; padding: 20px; margin-bottom: 20px; border-bottom: 1px solid #e9ecef;">
        <h2 style="margin-bottom: 20px;">Email Forwarded by Berny</h2>
        <p>This email was forwarded by Berny. You can view the <a href="https://example.com/original-message">original message</a> on our website.</p>
        <p>Email From: ${emailFrom}<p/>
        <p>Reply to this email to respond to the original sender.</p>
        <p>Domains that you gave this email to: ${domainsString} | <a href="#">View all</a></p>
        <p>Thanks, Berny</p>
        <hr>
      </div>
    `
}

export async function POST(request: Request) {
  const incomingEmailPayload = (await request.json()) as WebhookNewEmailPayload
  const bernyInboxEmails = incomingEmailPayload.to

  // Reroute the email to the primary email
  const reroutePromises = bernyInboxEmails.map(async (bernyInboxEmail) => {
    // Get the inbox data
    console.log('Fetching inbox...')
    const [inboxData] = await db
      .select()
      .from(InboxesTable)
      .where(sql`email = ${bernyInboxEmail}`)
    console.log({ inbox: inboxData })

    if (!inboxData) {
      throw new Error('Inbox not found')
    }

    // Get the user data
    console.log('Fetching primary email...')
    const [userData] = await db
      .select({ email: UsersTable.email })
      .from(UsersTable)
      .where(sql`id = ${inboxData.user_id}`)
    console.log({ userData })

    if (!userData) {
      throw new Error('User not found')
    }

    if (userData.email === incomingEmailPayload.from) {
      // This is a reply to an email that was sent from Berny
      return
    }

    // Get the domain data belonging to this inbox
    console.log('Fetching domain...')
    const [domainData] = await db
      .select()
      .from(DomainsTable)
      .where(sql`inbox_id = ${inboxData.id}`)
    console.log({ domainData })

    if (!domainData) {
      throw new Error('Domain not found')
    }

    // Get the mailslurp email that was received
    console.log('Fetching email data...')
    const incomingEmailData = await mailslurp.getEmail(
      incomingEmailPayload.emailId
    )

    if (userData.email === incomingEmailPayload.from) {
      // This is a reply to an email that was sent from Berny
    }

    // Get the mailslurp inbox
    console.log('Fetching inbox...')
    const inbox = await mailslurp.getInbox(inboxData.mailslurp_inbox_id)
    console.log({ inbox })

    const outgoingEmailHeader = headerHtml(
      incomingEmailData.from ?? 'unknown',
      [domainData.domain]
    )
    // Format the email body if it's not HTML (plain text)
    const outgoingEmailBody = incomingEmailData.isHTML
      ? incomingEmailData.body
      : `<div>${incomingEmailData.body}</div>`
    const outgoingEmailCompleteBody = outgoingEmailHeader + outgoingEmailBody

    // Build the email options for mailslurp
    const options: SendEmailOptions = {
      to: [userData.email],
      from: inboxData.email,
      subject: `[${incomingEmailData.from}] - ${incomingEmailData.subject}`,
      body: outgoingEmailCompleteBody,
      isHTML: true,
      attachments: incomingEmailData.attachments,
    }

    // Send the email
    console.log('Sending email...')
    await mailslurp.sendEmail(inbox.id, options)
    console.log('Email sent!')
  })

  await Promise.all(reroutePromises)
  return Response.json({ message: 'OK' })
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
