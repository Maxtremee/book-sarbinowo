import { AppShell, Button, Group, Header, Navbar, Text } from "@mantine/core";
import { Form, Link, Outlet } from "@remix-run/react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { useTranslation } from "react-i18next";
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

  return (
    <AppShell
      padding="md"
      header={
        <Header
          height="max(100%, 10vh)"
          p="md"
          style={{
            backgroundColor: "#1E2A3B",
            alignItems: "center",
          }}
        >
          <Group noWrap={false} sx={{ height: "100%" }} position="apart">
            <Text
              style={{ fontSize: "1.875rem" }}
              weight="bolder"
              color="white"
              component={Link}
              to="."
            >
              {t("reservations")}
            </Text>
            <Text color="white">
              {t("welcome")}, {user.firstName} {user?.lastName}
            </Text>
            <Group>
              {/* {user.role === "ADMIN" && (
                <Button component={Link} to="/admin">
                  {t("admin")}
                </Button>
              )} */}
              <Form action="/logout" method="post">
                <Button type="submit" color="gray">
                  {t("logout")}
                </Button>
              </Form>
            </Group>
          </Group>
        </Header>
      }
      styles={(theme) => ({
        main: {
          height: "90vh",
          overflow: "auto",
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : "",
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
}
