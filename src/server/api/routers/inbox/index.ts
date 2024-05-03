import MailSlurp, { type SendEmailOptions } from 'mailslurp-client'
import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from '~/server/api/trpc'
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

import { z } from 'zod'
import { createRandomEmail } from './utils/createRandomEmail'
import { TRPCError } from '@trpc/server'
import { WebhookNewEmailPayloadSchema } from './types'
import { and, eq, ilike, sql } from 'drizzle-orm'

export const inboxRouter = createTRPCRouter({
  create: authedProcedure
    .input(z.object({ domain: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const newEmail = createRandomEmail()

      const mailslurpInbox = await mailslurp.inboxController.createInbox({
        name: newEmail,
        emailAddress: newEmail + '@mailslurp.net',
      })

      const [inbox] = await ctx.db
        .insert(InboxesTable)
        .values({
          email: mailslurpInbox.emailAddress,
          user_id: ctx.user.userId,
          mailslurp_inbox_id: mailslurpInbox.id,
        })
        .returning()

      if (!inbox) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create inbox',
        })
      }

      await ctx.db.insert(DomainsTable).values({
        domain: input.domain,
        inbox_id: inbox.id,
      })

      return inbox.email
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedDomain] = await ctx.db
        .delete(DomainsTable)
        .where(eq(DomainsTable.inbox_id, input.id))
        .returning()

      if (!deletedDomain) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete domain',
        })
      }

      const [deletedInbox] = await ctx.db
        .delete(InboxesTable)
        .where(eq(InboxesTable.id, input.id))
        .returning()

      if (!deletedInbox) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete inbox',
        })
      }

      try {
        await mailslurp.deleteInbox(deletedInbox.mailslurp_inbox_id)
      } catch (error) {
        console.error('Failed to delete inbox from mailslurp', error)
      }

      return 'OK'
    }),

  inboxes: publicProcedure
    .input(z.object({ search: z.string().default('') }))
    .query(async ({ input, ctx }) => {
      if (input.search.length > 2) {
        const inboxesResponse = await ctx.db
          .select()
          .from(InboxesTable)
          .where(
            and(
              sql`user_id = ${ctx.user.userId}`,
              ilike(InboxesTable.email, `%${input.search}%`)
            )
          )
          .rightJoin(
            DomainsTable,
            sql`${InboxesTable}.id = ${DomainsTable}.inbox_id`
          )

        const domainsResponse = await ctx.db
          .select()
          .from(DomainsTable)
          .where(
            and(
              sql`user_id = ${ctx.user.userId}`,
              ilike(DomainsTable.domain, `%${input.search}%`)
            )
          )
          .rightJoin(
            InboxesTable,
            sql`${DomainsTable}.inbox_id = ${InboxesTable}.id`
          )

        return [...domainsResponse, ...inboxesResponse]
          .filter((el) => el)
          .map(({ inboxes: inbox, domains: domain }) => {
            if (!inbox || !domain) {
              return null
            }

            return { ...inbox, domain: domain }
          })
          .filter((el) => el)
      } else {
        const response = await ctx.db
          .select()
          .from(InboxesTable)
          .where(sql`user_id = ${ctx.user.userId}`)
          .rightJoin(
            DomainsTable,
            sql`${InboxesTable}.id = ${DomainsTable}.inbox_id`
          )

        return response
          .filter((el) => el)
          .map(({ inboxes: inbox, domains: domain }) => {
            if (!inbox || !domain) {
              return null
            }

            return { ...inbox, domain: domain }
          })
          .filter((el) => el)
      }
    }),

  incoming: publicProcedure
    .input(WebhookNewEmailPayloadSchema)
    .mutation(async ({ ctx, input: incomingEmailPayload }) => {
      const bernyInboxEmails = incomingEmailPayload.to

      // Reroute the email to the primary email
      const reroutePromises = bernyInboxEmails.map(async (bernyInboxEmail) => {
        // Get the inbox data
        console.log('Fetching inbox...')
        const [inboxData] = await ctx.db
          .select()
          .from(InboxesTable)
          .where(sql`email = ${bernyInboxEmail}`)
        console.log({ inbox: inboxData })

        if (!inboxData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Inbox not found',
          })
        }

        // Get the domain belonging to this inbox
        console.log('Fetching domain...')
        const [domainData] = await ctx.db
          .select()
          .from(DomainsTable)
          .where(sql`inbox_id = ${inboxData.id}`)
        console.log({ domainData })

        if (!domainData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Domain not found',
          })
        }

        // Get the primary email
        console.log('Fetching primary email...')
        const [userData] = await ctx.db
          .select({ email: UsersTable.email })
          .from(UsersTable)
          .where(sql`id = ${inboxData.user_id}`)
        console.log({ userData })

        if (!userData) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found',
          })
        }

        // Get the mailslurp email that was received
        console.log('Fetching email data...')
        const incomingEmailData = await mailslurp.getEmail(
          incomingEmailPayload.emailId
        )

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
        const outgoingEmailCompleteBody =
          outgoingEmailHeader + outgoingEmailBody

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
      return 'OK'
    }),
})
