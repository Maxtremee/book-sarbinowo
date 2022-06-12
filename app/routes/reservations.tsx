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
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">{t("reservations")}</Link>
        </h1>
        <p>
          {t("welcome")}, {user.firstName} {user?.lastName}
        </p>
        <div className="flex items-center justify-center gap-4">
          {user.role === "ADMIN" && (
            <Link
              to="/admin"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              {t("admin")}
            </Link>
          )}
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              {t("logout")}
            </button>
          </Form>
        </div>
      </header>

      <main className="flex h-full bg-white">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
