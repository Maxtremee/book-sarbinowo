import { Box } from "@chakra-ui/react"
import { ReactNode } from "react"
import Header from "./Header"

type DashboardLayoutProps = {
  children?: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box w="100vw" h="100vh">
      <Header />
      <main>{children}</main>
    </Box>
  )
}
