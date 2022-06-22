import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import {
  checkCurrentOccupant,
  getUserReservations,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import CurrentOccupant from "~/components/CurrentOccupant";
import { useTranslation } from "react-i18next";
import { Loader, Stack, Text } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useMediaQuery } from "@mantine/hooks";

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
  const monthsShown = useMediaQuery('(max-width: 800px', false)
  const [month, setMonth] = useState(
    dayjs().subtract(1, "month").startOf("month").toDate()
  );
  const data = useLoaderData() as LoaderData;
  const { t } = useTranslation();
  const fetcher = useFetcher();

  const isDateBetween = (date: Date) => {
    if (fetcher?.data) {
      const { reservations } = fetcher?.data;
      return !!reservations.some(
        (reservation: { since: Date; until: Date }) =>
          dayjs(date).add(1, 'day').isAfter(reservation.since) &&
          dayjs(date).isBefore(reservation.until)
      );
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("since", month.toISOString());

    fetcher.submit(params, { action: "/reservations/getReservations" });
  }, [month]);

  return (
    <Stack justify="flex-start" align="stretch">
      <CurrentOccupant reservation={data.currentOccupant} />
      {fetcher.state === "idle" ? (
        <Calendar
          dayStyle={(date) =>
            isDateBetween(date)
              ? { backgroundColor: "red", color: "white" }
              : {}
          }
          fullWidth
          amountOfMonths={monthsShown ? 2 : 3}
          month={month}
          onMonthChange={(month) => setMonth(month)}
          onChange={() => {}}
        />
      ) : (
        <Loader />
      )}

      {data.reservationListItems.length === 0 ? (
        <Text>{t("noReservations")}</Text>
      ) : (
        <ReservationList reservations={data.reservationListItems} />
      )}
    </Stack>
  );
}
