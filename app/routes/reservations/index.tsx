import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { getUserReservations } from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";

type LoaderData = {
  reservationListItems: Awaited<ReturnType<typeof getUserReservations>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const reservationListItems = await getUserReservations({ userId });
  return json<LoaderData>({ reservationListItems });
};

export default function ReservationsIndexPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <Link
        to="new"
        className="mb-4 inline-block rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
      >
        + New reservation
      </Link>
      {data.reservationListItems.length === 0 ? (
        <p className="p-4">No reservations yet</p>
      ) : (
        <ReservationList reservations={data.reservationListItems} />
      )}
    </>
  );
}
