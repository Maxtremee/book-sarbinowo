import { Button, Center } from "@chakra-ui/react"
import { signIn } from "next-auth/react"
import Logo from "./Logo"

export default function Homepage() {
  return (
    <Center h="100vh">
      <div>
        <Logo />
        <Center mt="2rem">
          <Button
            size="lg"
            colorScheme="blue"
            onClick={() =>
              signIn(undefined, {
                callbackUrl: "/dashboard",
              })
            }
          >
            Sign In
          </Button>
        </Center>
      </div>
    </Center>
  )
}
