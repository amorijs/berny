import MailSlurp, { GetEmailsPaginatedSortEnum } from 'mailslurp-client'
import { authedProcedure, createTRPCRouter } from '~/server/api/trpc'
import { z } from 'zod'
import { createRandomEmail } from './utils/createRandomEmail'
import { TRPCError } from '@trpc/server'
import { client, qb } from '~/server/db/edge'
import { GetMailForInboxOutputSchema, MailType } from './types'

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
        filter_single: {
          id: input.id,
          user: qb.select(qb.User, () => ({
            filter_single: { id: ctx.user.id },
          })),
        },
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

  getMail: authedProcedure
    .input(z.object({ mailId: z.string() }))
    .query(async ({ input, ctx }) => {
      return mailslurp.getEmail(input.mailId)
    }),

  getMailForInbox: authedProcedure
    .input(
      z.object({
        inboxId: z.string(),
        page: z.number().default(0),
        size: z.number().default(10),
      })
    )
    .output(GetMailForInboxOutputSchema)
    .query(async ({ input, ctx }) => {
      const inbox = await qb
        .select(qb.Inbox, () => ({
          mailslurpInboxId: true,
          user: { id: true },
          filter_single: { id: input.inboxId },
        }))
        .run(client)

      if (inbox?.user.id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Inbox not found',
        })
      }

      if (!inbox?.mailslurpInboxId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Inbox not found',
        })
      }

      const x = await mailslurp.emailController.getEmailsPaginated({
        page: input.page,
        size: input.size,
        sort: GetEmailsPaginatedSortEnum.DESC,
        inboxId: [inbox.mailslurpInboxId],
      })

      const results: MailType[] =
        x?.content?.map(({ id, subject, from, read, createdAt }) => ({
          id,
          from: from ?? 'Unknown',
          subject: subject ?? 'No subject',
          read,
          createdAt,
        })) ?? []

      return {
        total: x.totalElements,
        totalPages: x.totalPages,
        page: x.pageable?.pageNumber ?? 0,
        results,
      }
    }),

  replyToMail: authedProcedure
    .input(
      z.object({
        mailslurpInboxId: z.string(),
        mailId: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const inbox = await qb
        .select(qb.Inbox, () => ({
          email: true,
          mailslurpInboxId: true,
          user: { id: true },
          filter_single: { mailslurpInboxId: input.mailslurpInboxId },
        }))
        .run(client)

      if (inbox?.user.id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Inbox not found',
        })
      }

      const emailToReplyTo = await mailslurp.getEmail(input.mailId)

      if (
        !emailToReplyTo ||
        emailToReplyTo.inboxId !== inbox.mailslurpInboxId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email not found',
        })
      }

      return mailslurp.emailController.replyToEmail({
        emailId: input.mailId,
        replyToEmailOptions: {
          from: inbox.email,
          replyTo: inbox.email,
          body: input.body,
          isHTML: true,
        },
      })
    }),

  markAsRead: authedProcedure
    .input(z.object({ mailId: z.string() }))
    .mutation(async ({ input }) => {
      const x = await mailslurp.emailController.markAsRead({
        emailId: input.mailId,
        read: true,
      })
      console.log({ x })
      return x
    }),
})
