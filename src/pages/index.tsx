import type { NextPage } from "next"
import Head from "next/head"
import { signIn } from "next-auth/react"
import { trpc } from "../utils/trpc"
import { Button, Center } from "@chakra-ui/react"
import Logo from "../components/Logo"
import Homepage from "../components/Homepage"

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Book Sarbinowo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Homepage />
      </main>
    </>
  )
}

export default Home
