import { Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { InfoCircle } from "tabler-icons-react";
import type { checkCurrentOccupant } from "~/models/reservation.server";
import { useUser } from "~/utils";

export default function CurrentOccupant({
  reservation,
}: {
  reservation: Awaited<ReturnType<typeof checkCurrentOccupant>>;
}) {
  const { t } = useTranslation();
  const user = useUser();
  if (reservation) {
    if (reservation.userId === user.id) {
      return (
        <Alert color="green" icon={<InfoCircle />}>
          {t("haveANiceStay")}
        </Alert>
      );
    }
    return (
      <Alert
        color="yellow"
        icon={<InfoCircle />}
        title={`${t("currentlyInApartment")}: ${reservation.user.name}`}
      >
        {t("since")} {new Date(reservation.since).toLocaleString()}{" "}
        {t("until").toLowerCase()}{" "}
        {new Date(reservation.until).toLocaleString()}
      </Alert>
    );
  }
  return (
    <Alert color="blue" icon={<InfoCircle />}>
      {t("apartmentUnoccupied")}
    </Alert>
  );
}
