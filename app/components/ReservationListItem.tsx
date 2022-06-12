import { Badge, Group, Text } from "@mantine/core";
import { Reservation, ReservationState } from "@prisma/client";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function ReservationListItem({
  id,
  since,
  until,
  state,
  guests,
}: Reservation) {
  const { t } = useTranslation();
  return (
    <Link
      className={
        "block rounded-md border border-transparent text-blue-500 p-4 mt-4 drop-shadow-md hover:bg-blue-50"
      }
      to={id}
    >
      <Group position="apart">
        <div>
          <Text weight={500} size="lg" className="text-inherit">
            {dayjs(since).format("DD/MM/YYYY")}-
            {dayjs(until).format("DD/MM/YYYY")}
          </Text>
          <Text>
            {guests.length}{" "}
            {guests.length > 1
              ? t("guests").toLowerCase()
              : t("guest").toLowerCase()}
          </Text>
        </div>
        <Badge
          size="lg"
          color={state === ReservationState.ACTIVE ? "green" : "red"}
        >
          {t(state)}
        </Badge>
      </Group>
    </Link>
  );
}
