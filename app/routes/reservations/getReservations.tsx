import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getReservationsSinceThroughXMonths,
} from "~/models/reservation.server";

export type LoaderData = {
  reservations: Awaited<ReturnType<typeof getReservationsSinceThroughXMonths>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const since = params.get("since") as string;
  const months = params.get("months");

  invariant(since, "since date not found");

  const reservations = await getReservationsSinceThroughXMonths(
    new Date(since),
    months ? parseInt(months) : undefined
  );
  return json<LoaderData>({ reservations });
};
