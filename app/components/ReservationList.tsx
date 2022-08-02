import { Stack } from "@mantine/core";
import type { getUserReservationsOffset } from "~/models/reservation.server";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
  showCanceled,
}: {
  reservations: Awaited<ReturnType<typeof getUserReservationsOffset>>;
  showCanceled: boolean;
}) {
  return (
    <Stack>
      {reservations.map((reservation) => (
        <ReservationListItem
          key={reservation.id}
          {...reservation}
          showState={showCanceled}
        />
      ))}
    </Stack>
  );
}
