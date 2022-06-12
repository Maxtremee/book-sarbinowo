import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import {
  checkCurrentOccupant,
  getUserReservations,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import CurrentOccupant from "~/components/CurrentOccupant";
import { useTranslation } from "react-i18next";

type LoaderData = {
  reservationListItems: Awaited<ReturnType<typeof getUserReservations>>;
  currentOccupant: Awaited<ReturnType<typeof checkCurrentOccupant>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const reservationListItems = await getUserReservations({ userId });
  const currentOccupant = await checkCurrentOccupant();
  return json<LoaderData>({ reservationListItems, currentOccupant });
};

export default function ReservationsIndexPage() {
  const { t } = useTranslation();
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <CurrentOccupant reservation={data.currentOccupant} />
      <Link
        to="new"
        className="mb-4 inline-block rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
      >
        + {t("newReservation")}
      </Link>
      {data.reservationListItems.length === 0 ? (
        <p className="p-4">{t("noReservations")}</p>
      ) : (
        <ReservationList reservations={data.reservationListItems} />
      )}
    </>
  );
}
