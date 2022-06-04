import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getAllReservations,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";

type LoaderData = {
  reservationListItems: Awaited<ReturnType<typeof getAllReservations>>;
};

export const loader: LoaderFunction = async () => {
  const reservationListItems = await getAllReservations();
  return json<LoaderData>({ reservationListItems });
};

export default function ReservationsIndexPage() {
  const data = useLoaderData() as LoaderData;

  return data.reservationListItems.length === 0 ? (
    <p className="p-4">No reservations yet</p>
  ) : (
    <ReservationList reservations={data.reservationListItems} />
  );
}
