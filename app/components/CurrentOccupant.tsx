import { Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { checkCurrentOccupant } from "~/models/reservation.server";

export default function CurrentOccupant({
  reservation,
}: {
  reservation: Awaited<ReturnType<typeof checkCurrentOccupant>>;
}) {
  const { t } = useTranslation();
  return reservation ? (
    <Stack align="center" spacing={0}>
      <Text>
        {t("currentlyInApartment")}: {reservation.user.firstName}{" "}
        {reservation.user?.lastName}
      </Text>
      <Text>
        {t("since")} {new Date(reservation.since).toLocaleString()}{" "}
        {t("until").toLowerCase()}{" "}
        {new Date(reservation.until).toLocaleString()}
      </Text>
    </Stack>
  ) : (
    <Text align="center">{t("apartmentUnoccupied")}</Text>
  );
}
