import { Stack } from "@mantine/core";
import type { Guest, Reservation } from "~/models/reservation.server";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
  showCanceled,
}: {
  reservations: (Reservation & {
    guests: Guest[];
  })[];
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
