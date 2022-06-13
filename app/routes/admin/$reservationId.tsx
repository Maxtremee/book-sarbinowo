import { Badge } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import type {
  Reservation} from "~/models/reservation.server";
import {
  adminCancelReservation,
  getAdminReservation
} from "~/models/reservation.server";
import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";
import { requireAdmin } from "~/session.server";

type LoaderData = {
  reservation: Reservation;
  user: User | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  invariant(params.reservationId, "reservation not found");

  const reservation = await getAdminReservation({
    id: params.reservationId,
  });
  if (!reservation) {
    throw new Response("Not Found", { status: 404 });
  }
  const user = await getUserById(reservation.userId);
  return json<LoaderData>({ reservation, user });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdmin(request);
  invariant(params.reservationId, "reservation not found");

  await adminCancelReservation({ id: params.reservationId });

  return redirect("/admin");
};

export default function ReservationDetailsPage() {
  const { reservation, user } = useLoaderData() as LoaderData;

  const { id, guests } = reservation
  const since = dayjs(reservation.since);
  const until = dayjs(reservation.until);
  const arrival = reservation?.arrival ? dayjs(reservation.arrival) : null;
  const leave = reservation?.leave ? dayjs(reservation.leave) : null;
  const created = dayjs(reservation.createdAt);
  const updated = dayjs(reservation.updatedAt);

  return (
    <>
      <div className="flex w-full items-start justify-start gap-8">
        <Calendar
          initialMonth={since.toDate()}
          dayStyle={(date) =>
            dayjs(date).isAfter(dayjs(since).subtract(1, "day")) &&
            dayjs(date).isBefore(dayjs(until).add(1, "day"))
              ? { backgroundColor: "red", color: "white" }
              : {}
          }
        />
        <div>
          <h3 className="text-2xl font-bold">
            Since: {since.format("DD/MM/YYYY")} {arrival?.format("hh:mm")}
          </h3>
          <h3 className="text-2xl font-bold">
            Until: {until.format("DD/MM/YYYY")} {leave?.format("hh:mm")}
          </h3>
          <div className="py-6">
            Guests:{" "}
            {guests?.map((guest) => (
              <Badge key={guest}>{guest}</Badge>
            ))}
          </div>
          <p>ID: {id}</p>
          <p>Made by: {user?.email}</p>
          <p>Created at: {created.format("DD/MM/YYYY hh:mm")}</p>
          <p>Last updated at: {updated.format("DD/MM/YYYY hh:mm")}</p>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex items-start gap-3">
        <Link
          to="/admin"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Go back
        </Link>
        {until.isAfter(dayjs()) && (
          <Link
            to={`/admin/change/${reservation.id}`}
            className="rounded bg-yellow-500  py-2 px-4 text-white hover:bg-yellow-600 focus:bg-yellow-400"
          >
            Change
          </Link>
        )}
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
          >
            Cancel
          </button>
        </Form>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Reservation not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
