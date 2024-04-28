import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { UsersTable } from '~/server/db/schema'

export const userRouter = createTRPCRouter({
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
})
