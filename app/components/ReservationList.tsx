import { Stack } from "@mantine/core";
import type { Reservation } from "@prisma/client";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
  showCanceled,
}: {
  reservations: Reservation[];
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
