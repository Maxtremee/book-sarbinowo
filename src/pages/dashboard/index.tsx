import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { ReactElement } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import { trpc } from "../../utils/trpc"
import { NextPageWithLayout } from "../_app"

const Dashboard: NextPageWithLayout = () => {
  const user = useSession()
  const { data } = trpc.useQuery(["reservation.getAll"])

  return (
    <Box maxW="1440px">
      <Tabs>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Text>{JSON.stringify(data, undefined, 2)}</Text>
            <Text>{JSON.stringify(user.data, undefined, 2)}</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Dashboard
