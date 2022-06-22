import * as React from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";
import i18next from "~/i18next.server";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  Button,
  Center,
  Checkbox,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("login");
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }
  return json({ title });
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/reservations");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: t("invalidEmail") } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json<ActionData>(
      { errors: { password: t("passwordRequired") } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: t("passwordTooShort") } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { errors: { email: t("invalidCredentials") } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo,
  });
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data.title,
  };
};

export default function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/reservations";
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);
  return (
    <Center style={{ height: "100vh" }}>
      <Form method="post">
        <Stack
          align="stretch"
          justify="center"
          spacing="md"
          sx={(theme) => ({
            width: "35vw",
            [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
              width: "85vw",
            },
          })}
        >
          <TextInput
            label={t("email")}
            required
            error={actionData?.errors?.email}
            id="email"
            ref={emailRef}
            autoFocus
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-describedby="email-error"
          />
          <TextInput
            label={t("password")}
            required
            error={actionData?.errors?.password}
            id="password"
            ref={passwordRef}
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-describedby="password-error"
          />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" color="blue">
            {t("login")}
          </Button>
          <Group grow>
            <Checkbox label={t("remember")} id="remember" name="remember" />
            <Group position="right" spacing="xs">
              <Text size="sm" color="dimmed">
                {t("noAccount")}
              </Text>{" "}
              <Anchor
                size="sm"
                component={Link}
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                {t("signup")}
              </Anchor>
            </Group>
          </Group>
        </Stack>
      </Form>
    </Center>
  );
}
