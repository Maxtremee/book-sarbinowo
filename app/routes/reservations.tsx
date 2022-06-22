import {
  AppShell,
  Box,
  Burger,
  Button,
  Footer,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Stack,
  Text,
} from "@mantine/core";
import { Form, Link, Outlet } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "tabler-icons-react";
import TrelloLink from "~/components/TrelloLink";
import i18next from "~/i18next.server";

import { useUser } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("reservations");
  return json({ title });
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data.title,
  };
};

export default function ReservationsPage() {
  const { t } = useTranslation();
  const user = useUser();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      padding="md"
      footer={
        <Footer
          height={40}
          p="md"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TrelloLink />
        </Footer>
      }
      navbarOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="xs"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 220, lg: 300 }}
        >
          <Stack align="flex-start">
            <Button leftIcon={<Plus />} component={Link} to="new" fullWidth>
              {t("newReservation")}
            </Button>
          </Stack>
        </Navbar>
      }
      header={
        <Header
          height={70}
          p="md"
          style={{
            backgroundColor: "#1E2A3B",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                mr="xl"
              />
            </MediaQuery>

            <Group position="apart" style={{ width: "100%" }}>
              <Text
                style={{ fontSize: "1.875rem" }}
                weight="bolder"
                color="white"
                component={Link}
                to="."
              >
                {t("reservations")}
              </Text>
              <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                <Text align="center" color="white">
                  {t("welcome")}, {user.firstName} {user?.lastName}
                </Text>
              </MediaQuery>
              <Form action="/logout" method="post">
                <Button type="submit" color="gray">
                  {t("logout")}
                </Button>
              </Form>
            </Group>
          </div>
        </Header>
      }
      styles={(theme) => ({
        main: {
          overflowY: "auto",
          [`@media (min-width: ${theme.breakpoints.xl}px)`]: {
            display: "flex",
            justifyContent: "center",
          },
        },
      })}
    >
      <Box
        sx={(theme) => ({
          [`@media (min-width: ${theme.breakpoints.xl}px)`]: {
            width: theme.breakpoints.xl,
          },
        })}
      >
        <Outlet />
      </Box>
    </AppShell>
  );
}
