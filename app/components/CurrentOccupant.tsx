import { Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { InfoCircle } from "tabler-icons-react";
import type { checkCurrentOccupant } from "~/models/reservation.server";

export default function CurrentOccupant({
  reservation,
}: {
  reservation: Awaited<ReturnType<typeof checkCurrentOccupant>>;
}) {
  const { t } = useTranslation();
  return reservation ? (
    <Alert
      color="yellow"
      icon={<InfoCircle />}
      title={`${t("currentlyInApartment")}: ${reservation.user.firstName} ${
        reservation.user?.lastName || ""
      }`}
    >
      {t("since")} {new Date(reservation.since).toLocaleString()}{" "}
      {t("until").toLowerCase()} {new Date(reservation.until).toLocaleString()}
    </Alert>
  ) : (
    <Alert color="green" icon={<InfoCircle />}>
      {t("apartmentUnoccupied")}
    </Alert>
  );
}
