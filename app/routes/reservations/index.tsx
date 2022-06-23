import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import {
  checkCurrentOccupant,
  getUserReservations,
  getUsersClosestReservation,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import CurrentOccupant from "~/components/CurrentOccupant";
import { useTranslation } from "react-i18next";
import { Stack, Text, Title } from "@mantine/core";
import ReservationsCalendar from "~/components/ReservationsCalendar";
import ReservationListItem from "~/components/ReservationListItem";

type LoaderData = {
  currentOccupant: Awaited<ReturnType<typeof checkCurrentOccupant>>;
  closestReservation: Awaited<ReturnType<typeof getUsersClosestReservation>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const currentOccupant = await checkCurrentOccupant();
  const closestReservation = await getUsersClosestReservation(userId);
  return json<LoaderData>({ currentOccupant, closestReservation });
};

export default function ReservationsIndexPage() {
  const data = useLoaderData() as LoaderData;
  const { t } = useTranslation();

  return (
    <Stack justify="flex-start" align="stretch">
      <CurrentOccupant reservation={data.currentOccupant} />

      <Title order={3}>{t("calendar")}</Title>
      <ReservationsCalendar />

      <Title order={3}>{t("closestReservation")}</Title>
      {data.closestReservation ? (
        <ReservationListItem {...data.closestReservation} />
      ) : (
        <Text>{t("noReservations")}</Text>
      )}
    </Stack>
  );
}
