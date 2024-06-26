/**
 * @todo: handle multiple to addresses
 * @todo: handle multiple from addresses
 * @todo: persist reply chain
 * @todo: possibly sanitize email body to remove header
 */

import MailSlurp, {
  type Email,
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
        <p>This email was forwarded by Berny. View <a class="color: #fff; text-decoration: underline" href="https://berny.io/dashboard/inboxes/${inboxId}/${mailId}">original message</a></p>
        <p>Email From: ${emailFrom}<p/>
        <p>You can reply directly to this email to respond to the sender.</p>
        <p>You originally gave this email address to ${domainsString}
        <p>Thanks, Berny</p>
      </div>
    `
}

const handleEmailSentToReplyClient = async (emailData: Email) => {
  const emailTo = emailData.to[0]!

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

  if (!replyClient) {
    return false
  }

  if (replyClient.userInbox.user.email === emailData.from) {
    console.log('User reply from 3rd party app...')
    await mailslurp.sendEmail(replyClient.userInbox.mailslurpInboxId, {
      to: [replyClient.externalEmail],
      from: replyClient.userInbox.email,
      subject: emailData.subject ?? 'No Subject',
      body: emailData.body,
      isHTML: emailData.isHTML,
      attachments: emailData.attachments,
    })
    console.log('Email sent!')
  } else {
    console.log(
      'Email not from user, skipping...',
      replyClient.userInbox.user.email,
      emailData.from
    )
  }

  return true
}

const handleEmailSentToUserInbox = async (emailData: Email) => {
  const emailFrom = emailData.from!
  const emailTo = emailData.to[0]!

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
    // Need to figure out a better way to make these emails unique
    email: (
      await mailslurp.createInbox(
        `${emailFrom.replace('@', '_at_')}_${inboxData.mailslurpInboxId.split('-')[0]}@berny.io`
      )
    ).emailAddress,
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
    emailData.id,
    emailData.from ?? 'unknown',
    [inboxData.domains[0]?.name ?? 'unknown']
  )

  // Format the email body if it's not HTML (plain text)
  const outgoingEmailBody = emailData.isHTML
    ? emailData.body
    : `<div>${emailData.body}</div>`
  const outgoingEmailCompleteBody = outgoingEmailHeader + outgoingEmailBody

  // Build the email options for mailslurp
  const options: SendEmailOptions = {
    to: [inboxData.user.email],
    from: newReplyClient.email,
    replyTo: newReplyClient.email,
    subject: `[${emailData.from}] - ${emailData.subject}`,
    body: outgoingEmailCompleteBody,
    isHTML: true,
    attachments: emailData.attachments,
  }

  // Send the email
  console.log('Sending email...')
  await mailslurp.sendEmail(mailslurpInbox.id, options)
  console.log('Email sent!')
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WebhookNewEmailPayload
  const incomingEmailData = await mailslurp.getEmail(payload.emailId)
  await mailslurp.emailController.markAsRead({
    read: false,
    emailId: incomingEmailData.id,
  })

  const emailFrom = incomingEmailData.from
  const emailTo = incomingEmailData.to[0]

  if (!emailTo || !emailFrom) {
    console.log('Email missing to or from, skipping...', { emailTo, emailFrom })
    return
  }

  const wasHandledByReplyClient =
    await handleEmailSentToReplyClient(incomingEmailData)

  if (wasHandledByReplyClient) {
    return Response.json({ message: 'OK' })
  }

  // If we get here, it means the email is being sent to a user inbox, from an external source (ie from help@washingtonpost.com)
  await handleEmailSentToUserInbox(incomingEmailData)
  return Response.json({ message: 'OK' })
}

export async function GET() {
  return Response.json({ message: 'Hello World!' })
}
