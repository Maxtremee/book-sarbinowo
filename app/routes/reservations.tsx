import { Form, Link, Outlet } from "@remix-run/react";

import { useUser } from "~/utils";

export default function ReservationsPage() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Reservations</Link>
        </h1>
        <p>{user.email}</p>
        <div className="flex items-center justify-center gap-4">
          {user.role === "ADMIN" && (
            <Link
              to="/admin"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Admin panel
            </Link>
          )}
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
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
