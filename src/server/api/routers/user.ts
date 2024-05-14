import { TRPCError } from '@trpc/server'
import { addHours } from 'date-fns'
import MailSlurp from 'mailslurp-client'
import { z } from 'zod'
import { authedProcedure, createTRPCRouter } from '~/server/api/trpc'
import { client, qb } from '~/server/db/edge'

const mailslurp = new MailSlurp({
  apiKey: process.env.MAIL_SLURP_API_KEY!,
})

export const userRouter = createTRPCRouter({
  get: authedProcedure
    .input(z.object({ clerkId: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      return qb
        .select(qb.User, () => ({
          email: true,
          filter_single: { id: ctx.user.id },
        }))
        .run(client)

      // return ctx.db
      //   .select()
      //   .from(UsersTable)
      //   .where(sql`id = ${ctx.user.userId}`)
    }),

  // create: publicProcedure
  //   .input(z.object({ email: z.string().min(5), clerkId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db
  //       .insert(UsersTable)
  //       .values({
  //         email: input.email,
  //         clerk_id: input.clerkId,
  //       })
  //       .returning()
  //   }),

  update: authedProcedure
    .input(
      z.object({ email: z.string().min(5), clerkId: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      const updateExp = qb.update(qb.User, () => ({
        filter_single: { id: ctx.user.id },
        set: { email: input.email, clerkId: input.clerkId },
      }))

      return qb.select(updateExp, () => ({ email: true })).run(client)

      // return ctx.db
      //   .update(UsersTable)
      //   .set({ email: input.email })
      //   .where(sql`user_id = ${ctx.user.userId}`)
      //   .returning()
    }),

  startEmailVerification: authedProcedure
    .input(z.object({ newEmail: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userSelect = qb.select(qb.User, () => ({
        id: true,
        email: true,
        filter_single: { id: ctx.user.id },
      }))

      const user = await userSelect.run(client)

      if (!user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User not found',
        })
      }

      const emailVerificationInsert = qb.insert(qb.EmailVerification, {
        expiresAt: addHours(new Date(), 1),
        user: userSelect,
        newEmail: input.newEmail,
        oldEmail: user.email,
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
      })

      const emailVerification = await qb
        .select(emailVerificationInsert, () => ({
          id: true,
          otp: true,
        }))
        .run(client)

      await mailslurp.sendEmail('3d7b0fe6-fed8-433b-8306-0d77d3154db6', {
        from: 'admin@berny.io',
        to: [input.newEmail],
        subject: 'Email Change Verification',
        body: `Your verification code is: ${emailVerification.otp}. If you did not request this change, please let us know at support@berny.io.`,
      })

      return emailVerification.id
    }),

  completeEmailVerification: authedProcedure
    .input(z.object({ otp: z.string(), verificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const emailVerificationSelect = qb.select(qb.EmailVerification, () => ({
        id: true,
        newEmail: true,
        otp: true,
        user: { id: true },
        filter_single: { id: input.verificationId },
      }))

      const emailVerification = await emailVerificationSelect.run(client)

      if (!emailVerification) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Email verification not found',
        })
      }

      if (emailVerification.user.id !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Email verification does not belong to user',
        })
      }

      if (emailVerification.otp !== input.otp) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid OTP',
        })
      }

      const userUpdate = qb.update(qb.User, () => ({
        filter_single: { id: emailVerification.user.id },
        set: { email: emailVerification.newEmail },
      }))

      const updatedUser = await qb
        .select(userUpdate, () => ({ email: true }))
        .run(client)

      if (!updatedUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user email',
        })
      }

      await qb
        .delete(qb.EmailVerification, () => ({
          filter_single: { id: input.verificationId },
        }))
        .run(client)

      return updatedUser.email
    }),
})
