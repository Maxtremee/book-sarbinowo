import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getUsersFromPreviousReservations } from "~/models/reservation.server";
import { requireUser } from "~/session.server";

export type LoaderData = {
  guests: Awaited<ReturnType<typeof getUsersFromPreviousReservations>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { id: userId } = await requireUser(request);
  const params = new URL(request.url).searchParams;
  const searchStr = params.get("name") as string;
  const limit = parseInt(params.get("limit") as string);

  const guests = await getUsersFromPreviousReservations({
    userId,
    searchStr,
    limit,
  });
  return json<LoaderData>({ guests });
};
