import { Divider, Stack, Text } from "@mantine/core";
import { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const { t } = useTranslation();
  const upcoming = reservations.filter(({ since }) =>
    dayjs(since).isAfter(dayjs())
  );
  const current = reservations.filter(
    ({ since, until }) =>
      dayjs(until).isAfter(dayjs()) && dayjs(since).isBefore(dayjs())
  );
  const previous = reservations.filter(({ until }) =>
    dayjs(until).isBefore(dayjs())
  );
  return (
    <>
      <Text weight="bold">{t("upcoming")}</Text>
      {upcoming.length === 0 ? (
        <Text>{t("noUpcoming")}</Text>
      ) : (
        <Stack>
          {upcoming.map((reservation) => (
            <ReservationListItem key={reservation.id} {...reservation} />
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
            <ReservationListItem key={reservation.id} {...reservation} />
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
            <ReservationListItem key={reservation.id} {...reservation} />
          ))}
        </Stack>
      )}
    </>
  );
}
