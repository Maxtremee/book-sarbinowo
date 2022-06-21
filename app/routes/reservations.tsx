import {
  AppShell,
  Burger,
  Button,
  Footer,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Form, Link, Outlet } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Stack align="flex-start">
            <Text>
              {t("welcome")}, {user.firstName} {user?.lastName}
            </Text>
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
                size="sm"
                mr="xl"
                color="gray"
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
          maxWidth: theme.breakpoints.xl,
          overflow: "auto",
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
}
