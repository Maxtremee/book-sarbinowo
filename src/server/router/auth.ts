import { createProtectedRouter } from "./protected-router"

// Example router with queries that can only be hit if the user requesting is signed in
const authRouter = createProtectedRouter().query("getSession", {
  resolve({ ctx }) {
    return ctx.session
  },
})

export default authRouter
