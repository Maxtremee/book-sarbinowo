import { Button, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useTranslation } from "react-i18next";
import TrelloLink from "~/components/TrelloLink";
import i18next from "~/i18next.server";

import { useOptionalUser } from "~/utils";

type LoaderData = {
  title: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("app");
  return json<LoaderData>({ title });
};

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export default function Index() {
  const user = useOptionalUser();
  const { t, ready } = useTranslation();

  if (!ready) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Center
        sx={(theme) => ({
          height: "95vh",
          [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            height: "85vh",
          },
        })}
        style={{}}
        component="main"
      >
        <Stack align="center">
          <Text
            weight="bold"
            align="center"
            style={{ fontSize: "3rem" }}
            transform="uppercase"
            variant="gradient"
            gradient={{ from: "blue", to: "aquamarine", deg: 45 }}
          >
            {t("app")}
          </Text>
          <Group position="center">
            {user ? (
              <Button
                color="blue"
                variant="subtle"
                component={Link}
                to="/reservations"
              >
                {t("viewReservations")} {user.email}
              </Button>
            ) : (
              <>
                <Button color="blue" component={Link} to="/join">
                  {t("signup")}
                </Button>{" "}
                <Button color="blue" component={Link} to="/login">
                  {t("login")}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </Center>
      <Center style={{ height: "5vh" }} component="footer">
        <TrelloLink />
      </Center>
    </>
  );
}
