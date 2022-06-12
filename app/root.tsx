import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";
import i18next from "~/i18next.server";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { MantineProvider } from "@mantine/core";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  locale: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await i18next.getLocale(request);
  const user = await getUser(request);
  return json<LoaderData>({ locale, user });
};

export const meta: MetaFunction = ({ data }) => ({
  charset: "utf-8",
  title: "Book Sarbinowo",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  let { locale } = useLoaderData<LoaderData>();
  let { i18n } = useTranslation();
  useChangeLanguage(locale);

  return (
    <html className="h-full" lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <MantineProvider
          theme={{ datesLocale: locale }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </MantineProvider>
      </body>
    </html>
  );
}
