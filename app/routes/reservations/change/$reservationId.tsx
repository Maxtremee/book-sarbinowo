import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getReservation, Reservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  reservation: Reservation;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservation not found");

  const reservation = await getReservation({
    userId,
    id: params.reservationId,
  });
  if (!reservation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ reservation });
};

export default function ReservationChange() {
  const { reservation } = useLoaderData() as LoaderData;

  return <p>{JSON.stringify(reservation, undefined, 2)}</p>;
}
