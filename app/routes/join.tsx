import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";
import { useTranslation } from "react-i18next";
import i18next from "~/i18next.server";
import {
  Anchor,
  Button,
  Center,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("signup");
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({ title });
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
    firstName?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("first-name");
  const lastName = formData.get("last-name") as string;
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

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

  if (typeof firstName !== "string") {
    return json<ActionData>(
      { errors: { password: t("firstNameRequired") } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: t("alreadyExists") } },
      { status: 400 }
    );
  }

  const user = await createUser({ email, password, name: `${firstName} ${lastName}`.trim() });

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data.title,
  };
};

export default function Join() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const firstNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.firstName) {
      firstNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Center style={{ height: "100vh" }}>
      <Form method="post">
        <Stack
          align="stretch"
          justify="center"
          spacing="md"
          sx={{
            width: "30vw",
            "@media (max-width: 850px)": {
              width: "85vw",
            },
          }}
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
            autoComplete="new-password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-describedby="password-error"
          />
          <TextInput
            label={t("firstName")}
            required
            error={actionData?.errors?.firstName}
            id="first-name"
            ref={firstNameRef}
            name="first-name"
            autoComplete="given-name"
            aria-invalid={actionData?.errors?.firstName ? true : undefined}
            aria-describedby="first-name-error"
          />
          <TextInput
            label={t("lastName")}
            id="last-name"
            name="last-name"
            autoComplete="family-name"
          />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button color="blue" type="submit">
            {t("signup")}
          </Button>
          <Group position="center" spacing="xs">
            <Text size="sm" color="dimmed">
              {t("alreadyHaveAccount")}
            </Text>{" "}
            <Anchor
              size="sm"
              component={Link}
              to={{
                pathname: "/login",
                search: searchParams.toString(),
              }}
            >
              {t("login")}
            </Anchor>
          </Group>
        </Stack>
      </Form>
    </Center>
  );
}
