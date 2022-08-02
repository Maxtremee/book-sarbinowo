import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { checkAvailability } from "~/models/reservation.server";

export type LoaderData = {
  isAvailable: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const since = params.get("since");
  const until = params.get("until");

  invariant(since, "since date not found");
  invariant(until, "until date not found");

  const isAvailable = await checkAvailability({
    since: new Date(since),
    until: new Date(until),
  });
  return json<LoaderData>({ isAvailable });
};
