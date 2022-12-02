import { z } from "zod"
import { createProtectedRouter } from "./protected-router"

const reservationRouter = createProtectedRouter().query("getAll", {
  async resolve({ ctx }) {
    return await ctx.prisma.reservation.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })
  },
})

export default reservationRouter
