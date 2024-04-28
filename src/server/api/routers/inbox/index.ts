import MailSlurp, { type SendEmailOptions } from 'mailslurp-client'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { DomainsTable, ProxiesTable, UsersTable } from '~/server/db/schema'

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
import { and, ilike, sql } from 'drizzle-orm'

export const inboxRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ domain: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const newEmail = createRandomEmail()

      const inbox = await mailslurp.inboxController.createInbox({
        name: newEmail,
        emailAddress: newEmail + '@mailslurp.net',
      })

      const [proxy] = await ctx.db
        .insert(ProxiesTable)
        .values({
          email: inbox.emailAddress,
          user_id: 1,
          inbox_id: inbox.id,
        })
        .returning()

      if (!proxy) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create proxy',
        })
      }

      await ctx.db.insert(DomainsTable).values({
        domain: input.domain,
        proxy_id: proxy.id,
      })

      return proxy.email
    }),

  inboxes: publicProcedure
    .input(z.object({ search: z.string().default('') }))
    .query(async ({ input, ctx }) => {
      if (input.search.length > 2) {
        const proxiesResponse = await ctx.db
          .select()
          .from(ProxiesTable)
          .where(ilike(ProxiesTable.email, `%${input.search}%`))
          .rightJoin(
            DomainsTable,
            sql`${ProxiesTable}.id = ${DomainsTable}.proxy_id`
          )

        const domainsResponse = await ctx.db
          .select()
          .from(DomainsTable)
          .where(ilike(DomainsTable.domain, `%${input.search}%`))
          .rightJoin(
            ProxiesTable,
            sql`${DomainsTable}.proxy_id = ${ProxiesTable}.id`
          )

        return [...domainsResponse, ...proxiesResponse]
          .filter((el) => el)
          .map(({ proxies: proxy, domains: domain }) => {
            if (!proxy || !domain) {
              return null
            }

            return { ...proxy, domain: domain }
          })
          .filter((el) => el)
      } else {
        const response = await ctx.db
          .select()
          .from(ProxiesTable)
          .where(sql`user_id = 1`)
          .rightJoin(
            DomainsTable,
            sql`${ProxiesTable}.id = ${DomainsTable}.proxy_id`
          )

        return response
          .filter((el) => el)
          .map(({ proxies: proxy, domains: domain }) => {
            if (!proxy || !domain) {
              return null
            }

            return { ...proxy, domain: domain }
          })
          .filter((el) => el)
      }
    }),

  incoming: publicProcedure
    .input(WebhookNewEmailPayloadSchema)
    .mutation(async ({ ctx, input: incomingEmailPayload }) => {
      const proxyEmails = incomingEmailPayload.to

      // Reroute the email to the primary email
      const reroutePromises = proxyEmails.map(async (proxyEmail) => {
        // Get the proxy data
        console.log('Fetching proxy...')
        const [proxyData] = await ctx.db
          .select()
          .from(ProxiesTable)
          .where(sql`email = ${proxyEmail}`)
        console.log({ proxy: proxyData })

        if (!proxyData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Proxy not found',
          })
        }

        // Get the domain belonging to this proxy
        console.log('Fetching domain...')
        const [domainData] = await ctx.db
          .select()
          .from(DomainsTable)
          .where(sql`proxy_id = ${proxyData.id}`)
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
          .where(sql`id = ${proxyData.user_id}`)
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
        const inbox = await mailslurp.getInbox(proxyData.inbox_id)
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
          from: proxyData.email,
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
