import { sql } from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { UsersTable } from '~/server/db/schema'

export const userRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(UsersTable)
      .where(sql`id = 1`)
  }),

  create: publicProcedure
    .input(z.object({ email: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .insert(UsersTable)
        .values({
          email: input.email,
        })
        .returning()
    }),

  update: publicProcedure
    .input(z.object({ email: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(UsersTable)
        .set({ email: input.email })
        .where(sql`id = 1`)
        .returning()
    }),

  clerkWebhook: publicProcedure.query(async ({ input }) => {
    console.log({ input })
  }),
})
