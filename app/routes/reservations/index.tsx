import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import {
  checkCurrentOccupant,
  getUserReservations,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import CurrentOccupant from "~/components/CurrentOccupant";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Text,
} from "@mantine/core";
import ReservationsCalendar from "~/components/ReservationsCalendar";

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
  const data = useLoaderData() as LoaderData;
  const { t } = useTranslation();

  return (
    <Stack justify="flex-start" align="stretch">
      <CurrentOccupant reservation={data.currentOccupant} />
      <ReservationsCalendar />

      {data.reservationListItems.length === 0 ? (
        <Text>{t("noReservations")}</Text>
      ) : (
        <ReservationList reservations={data.reservationListItems} />
      )}
    </Stack>
  );
}
