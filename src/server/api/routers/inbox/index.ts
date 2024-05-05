import MailSlurp from 'mailslurp-client'
import { authedProcedure, createTRPCRouter } from '~/server/api/trpc'
import { z } from 'zod'
import { createRandomEmail } from './utils/createRandomEmail'
import { TRPCError } from '@trpc/server'
import { client, qb } from '~/server/db/edge'

const mailslurp = new MailSlurp({
  apiKey: process.env.MAIL_SLURP_API_KEY!,
})

export const inboxRouter = createTRPCRouter({
  create: authedProcedure
    .input(z.object({ domain: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const newEmail = createRandomEmail()

      const mailslurpInbox = await mailslurp.inboxController.createInbox({
        name: newEmail,
        emailAddress: newEmail + '@mailslurp.net',
      })

      // User query expression
      const userQuery = qb.select(qb.User, () => ({
        filter_single: { id: ctx.user.id },
      }))

      // Inbox insert expression
      const inboxMutation = qb.insert(qb.Inbox, {
        email: mailslurpInbox.emailAddress,
        mailslurpInboxId: mailslurpInbox.id,
        user: userQuery,
      })

      // Domain insert expression
      const domainMutation = qb.insert(qb.Domain, {
        name: input.domain,
        inbox: qb.select(inboxMutation),
      })

      // Execute the query
      const { inboxEmail } = await qb
        .select(domainMutation, (domain) => ({
          inboxEmail: domain.inbox.email,
        }))
        .run(client)

      if (!inboxEmail) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create inbox',
        })
      }

      return inboxEmail
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleteInboxExp = qb.delete(qb.Inbox, () => ({
        filter_single: { id: input.id, user: { id: ctx.user.id } },
      }))

      const deletedInbox = await qb
        .select(deleteInboxExp, () => ({
          mailslurpInboxId: true,
        }))
        .run(client)

      if (!deletedInbox?.mailslurpInboxId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete inbox',
        })
      }

      try {
        await mailslurp.deleteInbox(deletedInbox.mailslurpInboxId)
      } catch (error) {
        console.error('Failed to delete inbox from mailslurp', error)
      }

      return 'OK'
    }),

  inboxes: authedProcedure
    .input(z.object({ search: z.string().default('') }))
    .query(async ({ input, ctx }) => {
      const userInboxData = await qb
        .select(qb.User, () => ({
          filter_single: { id: ctx.user.id },

          inboxes: (i) => {
            const emailFilter = qb.op(i.email, 'ilike', `%${input.search}%`)
            const domainsFilter = qb.op(
              i['<inbox[is Domain]'].name,
              'ilike',
              `%${input.search}%`
            )
            const filter = qb.op(emailFilter, 'or', domainsFilter)

            return {
              order_by: i.createdAt,
              filter: input.search.length > 2 ? filter : undefined,

              id: true,
              email: true,
              createdAt: true,
              domains: {
                name: true,
              },
            }
          },
        }))
        .run(client)

      return userInboxData?.inboxes ?? []
    }),
})
