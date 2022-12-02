// src/server/router/index.ts
import { createRouter } from "./context"
import superjson from "superjson"

import authRouter from "./auth"
import reservationRouter from "./reservation"

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("reservation.", reservationRouter)

// export type definition of API
export type AppRouter = typeof appRouter
