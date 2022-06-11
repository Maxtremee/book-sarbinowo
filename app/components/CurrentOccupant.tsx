import { Stack, Text } from "@mantine/core";
import { checkCurrentOccupant } from "~/models/reservation.server";

export default function CurrentOccupant({
  reservation,
}: {
  reservation: Awaited<ReturnType<typeof checkCurrentOccupant>>;
}) {
  return reservation ? (
    <Stack align="center" spacing={0}>
      <Text>
        Currently in apartment: {reservation.user.firstName}{" "}
        {reservation.user?.lastName}
      </Text>
      <Text>
        Since {new Date(reservation.since).toLocaleString()} until {new Date(reservation.until).toLocaleString()}
      </Text>
    </Stack>
  ) : (
    <Text align="center">Apartment is unoccupied</Text>
  );
}
