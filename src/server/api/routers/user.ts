import { TRPCError } from '@trpc/server'
import { sql } from 'drizzle-orm'
import { z } from 'zod'

import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from '~/server/api/trpc'
import { UsersTable } from '~/server/db/schema'

export const userRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ clerkId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const clerkId = input?.clerkId ?? ctx.user?.clerkId

      if (!clerkId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'clerkId is required',
        })
      }

      return ctx.db
        .select()
        .from(UsersTable)
        .where(sql`clerk_id = ${clerkId}`)
    }),

  create: publicProcedure
    .input(z.object({ email: z.string().min(5), clerkId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .insert(UsersTable)
        .values({
          email: input.email,
          clerk_id: input.clerkId,
        })
        .returning()
    }),

  update: authedProcedure
    .input(
      z.object({ email: z.string().min(5), clerkId: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(UsersTable)
        .set({ email: input.email })
        .where(sql`user_id = ${ctx.user.userId}`)
        .returning()
    }),
})
