import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { getUserReservations } from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import { useTranslation } from "react-i18next";
import { Stack, Text } from "@mantine/core";

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
  const { t } = useTranslation();

  return (
    <Stack justify="flex-start" align="stretch">
      {data.reservationListItems.length === 0 ? (
        <Text>{t("noReservations")}</Text>
      ) : (
        <ReservationList reservations={data.reservationListItems} />
      )}
    </Stack>
  );
}
