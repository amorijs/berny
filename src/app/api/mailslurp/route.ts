/**
 * @todo: handle multiple to addresses
 * @todo: handle multiple from addresses
 * @todo: persist reply chain
 * @todo: possibly sanitize email body to remove header
 */

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
      <div style="background-color: #171513; color: #fff; padding: 20px; margin-bottom: 20px; font-size: 12px; width: 500px;">
        <h2 style="margin-bottom: 20px;">Email Forwarded by Berny</h2>
        <p>This email was forwarded by Berny. View <a href="https://berny.io/dashboard/inboxes/${inboxId}/${mailId}">original message</a></p>
        <p>Email From: ${emailFrom}<p/>
        <p>You can reply directly to this email to respond to the sender.</p>
        <p>You originally gave this email address to ${domainsString}
        <p>Thanks, Berny</p>
      </div>
    `
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WebhookNewEmailPayload
  const incomingEmailData = await mailslurp.getEmail(payload.emailId)

  const emailFrom = incomingEmailData.from
  const emailTo = incomingEmailData.to[0]

  if (!emailTo || !emailFrom) {
    console.log('Email missing to or from, skipping...', { emailTo, emailFrom })
    return
  }

  // First check if this email is being sent to a replyClient email
  const replyClient = await qb
    .select(qb.ReplyClient, () => ({
      email: true,
      externalEmail: true,
      userInbox: {
        email: true,
        mailslurpInboxId: true,
        user: { email: true },
      },
      filter_single: { email: emailTo },
    }))
    .run(client)

  if (replyClient) {
    if (replyClient.userInbox.user.email !== incomingEmailData.from) {
      console.log(
        'Email not from user, skipping...',
        replyClient.userInbox.user.email,
        incomingEmailData.from
      )
      return
    }

    console.log('User reply...')
    await mailslurp.sendEmail(replyClient.userInbox.mailslurpInboxId, {
      to: [replyClient.externalEmail],
      from: replyClient.userInbox.email,
      subject: incomingEmailData.subject ?? 'No Subject',
      body: incomingEmailData.body,
      isHTML: incomingEmailData.isHTML,
      attachments: incomingEmailData.attachments,
    })
    console.log('Email sent!')
    return Response.json({ message: 'OK' })
  }

  // If we get here, it means the email is being sent to a user inbox, from an external source (ie from help@washingtonpost.com)
  console.log('Fetching inbox...')
  const inboxQuery = qb.select(qb.Inbox, () => ({
    id: true,
    email: true,
    mailslurpInboxId: true,
    user: { email: true },
    domains: { name: true },
    filter_single: { email: emailTo },
  }))
  const inboxData = await inboxQuery.run(client)
  console.log({ inbox: inboxData })

  if (!inboxData) {
    throw new Error('Inbox not found')
  }

  // Create a new reply client for this external email
  const replyClientInsert = qb.insert(qb.ReplyClient, {
    email: (await mailslurp.createInbox()).emailAddress,
    externalEmail: emailFrom,
    userInbox: inboxQuery,
  })
  const newReplyClient = await qb
    .select(replyClientInsert, () => ({
      email: true,
    }))
    .run(client)

  // Get the mailslurp inbox
  console.log('Fetching mailslurp inbox...')
  const mailslurpInbox = await mailslurp.getInbox(inboxData.mailslurpInboxId)
  console.log({ mailslurpInbox })

  const outgoingEmailHeader = headerHtml(
    inboxData.id,
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
    from: newReplyClient.email,
    replyTo: newReplyClient.email,
    subject: `[${incomingEmailData.from}] - ${incomingEmailData.subject}`,
    body: outgoingEmailCompleteBody,
    isHTML: true,
    attachments: incomingEmailData.attachments,
  }

  // Send the email
  console.log('Sending email...')
  await mailslurp.sendEmail(mailslurpInbox.id, options)
  console.log('Email sent!')

  return Response.json({ message: 'OK' })
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
