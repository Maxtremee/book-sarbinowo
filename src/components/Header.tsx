import { Avatar, Box, Button, Center } from "@chakra-ui/react"
import { signOut, useSession } from "next-auth/react"
import Logo from "./Logo"

export default function Header() {
  const user = useSession()
  return (
    <Box
      as="header"
      bg="gray.300"
      borderRadius="0 0 1rem 1rem"
      pb=".5rem"
      p="1rem"
    >
      <Center width="100%" justifyContent="space-between" alignItems="center">
        <Logo />
        <Center minW="15%" justifyContent="space-between">
          <Avatar src={user.data?.user?.image || ""} />
          <Button
            colorScheme="blue"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
          >
            Sign Out
          </Button>
        </Center>
      </Center>
    </Box>
  )
}
