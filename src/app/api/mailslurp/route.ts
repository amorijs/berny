import MailSlurp, {
  type SendEmailOptions,
  type WebhookNewEmailPayload,
} from 'mailslurp-client'
import { client, qb } from '~/server/db/edge'

const mailslurp = new MailSlurp({
  apiKey: process.env.MAIL_SLURP_API_KEY!,
})

const headerHtml = (
  inboxId: string,
  mailId: string,
  emailFrom: string,
  domains: string[]
) => {
  let domainsString = ''

  if (domains.length <= 2) {
    domainsString = domains.join(', ')
  } else {
    const first2 = domains.slice(0, 2)
    domains.push(`+${domains.length - 2} more`)
    domainsString = [...first2, `+${domains.length - 2} more`].join(', ')
  }

  return `
      <div style="background-color: #171513; color: #fff; padding: 20px; margin-bottom: 20px; border-bottom: 1px solid #e9ecef;">
        <h2 style="margin-bottom: 20px;">Email Forwarded by Berny</h2>
        <p>This email was forwarded by Berny. You can view the <a href="https://berny.io/${inboxId}/mail/${mailId}">original message</a> on our website.</p>
        <p>Email From: ${emailFrom}<p/>
        <p>Reply to this email to respond to the original sender.</p>
        <p>You gave this email to ${domainsString}
        <p>Thanks, Berny</p>
        <hr>
      </div>
    `
}

const tempCache: Record<string, boolean> = {}

export async function POST(request: Request) {
  const incomingEmailPayload = (await request.json()) as WebhookNewEmailPayload
  console.log({ incomingEmailPayload })
  const bernyInboxEmails = incomingEmailPayload.to

  // Reroute the email to the primary email
  const reroutePromises = bernyInboxEmails.map(async (bernyInboxEmail) => {
    // Get the inbox data
    console.log('Fetching inbox...')
    const inboxData = await qb
      .select(qb.Inbox, () => ({
        id: true,
        email: true,
        mailslurpInboxId: true,
        user: {
          email: true,
        },
        domains: {
          name: true,
        },
        filter_single: { email: bernyInboxEmail },
      }))
      .run(client)
    console.log({ inbox: inboxData })

    if (!inboxData) {
      throw new Error('Inbox not found')
    }

    // if (userData.email === incomingEmailPayload.from) {
    // // This is a reply to an email that was sent from Berny
    // return
    // }

    // Get the mailslurp email that was received
    console.log('Fetching email data...')
    const incomingEmailData = await mailslurp.getEmail(
      incomingEmailPayload.emailId
    )
    console.log({ incomingEmailData })

    if (inboxData.user.email === incomingEmailPayload.from) {
      if (tempCache[inboxData.user.email + inboxData.email]) {
        console.log('skipping email')
        return
      } else {
        tempCache[inboxData.user.email + inboxData.email] = true
      }
      // This is a reply to an email that was sent from Berny
    }

    // Get the mailslurp inbox
    console.log('Fetching inbox...')
    const inbox = await mailslurp.getInbox(inboxData.mailslurpInboxId)
    console.log({ inbox })

    const outgoingEmailHeader = headerHtml(
      inbox.id,
      incomingEmailData.id,
      incomingEmailData.from ?? 'unknown',
      [inboxData.domains[0]?.name ?? 'unknown']
    )
    // Format the email body if it's not HTML (plain text)
    const outgoingEmailBody = incomingEmailData.isHTML
      ? incomingEmailData.body
      : `<div>${incomingEmailData.body}</div>`
    const outgoingEmailCompleteBody = outgoingEmailHeader + outgoingEmailBody

    // Build the email options for mailslurp
    const options: SendEmailOptions = {
      to: [inboxData.user.email],
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
