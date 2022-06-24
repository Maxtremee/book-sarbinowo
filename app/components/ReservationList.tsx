import { Divider, Stack, Switch, Text } from "@mantine/core";
import type { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const [showCanceled, setShowCanceled] = useState(false);
  const { t } = useTranslation();
  const filteredReservations = reservations.filter(({ state }) => {
    return showCanceled ? state : state === "ACTIVE";
  });
  const upcoming = filteredReservations.filter(({ since }) =>
    dayjs(since).isAfter(dayjs())
  );
  const current = filteredReservations.filter(
    ({ since, until }) =>
      dayjs(until).isAfter(dayjs()) && dayjs(since).isBefore(dayjs())
  );
  const previous = filteredReservations.filter(({ until }) =>
    dayjs(until).isBefore(dayjs())
  );
  return (
    <>
      <Switch
        label={t("showCanceled")}
        checked={showCanceled}
        onChange={(event) => setShowCanceled(event.currentTarget.checked)}
      />
      <Text weight="bold">{t("upcoming")}</Text>
      {upcoming.length === 0 ? (
        <Text>{t("noUpcoming")}</Text>
      ) : (
        <Stack>
          {upcoming.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              {...reservation}
              showState={showCanceled}
            />
          ))}
        </Stack>
      )}
      <Divider />

      <Text weight="bold">{t("current")}</Text>
      {current.length === 0 ? (
        <Text>{t("noCurrent")}</Text>
      ) : (
        <Stack>
          {current.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              {...reservation}
              showState={showCanceled}
            />
          ))}
        </Stack>
      )}
      <Divider />

      <Text weight="bold">{t("previous")}</Text>
      {previous.length === 0 ? (
        <Text>{t("noPrevious")}</Text>
      ) : (
        <Stack>
          {previous.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              {...reservation}
              showState={showCanceled}
            />
          ))}
        </Stack>
      )}
    </>
  );
}
