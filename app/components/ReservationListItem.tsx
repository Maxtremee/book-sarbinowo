import { Badge, Group, Paper, Text } from "@mantine/core";
import type { Reservation } from "@prisma/client";
import { ReservationState } from "@prisma/client";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function ReservationListItem({
  id,
  since,
  until,
  state,
  guests,
  showState = false,
}: Reservation & { showState?: boolean }) {
  const { t } = useTranslation();

  return (
    <Paper
      sx={(theme) => ({
        padding: theme.spacing.sm,
        "&:hover": {
          backgroundColor: theme.colors.gray[0],
        },
      })}
      shadow="lg"
      component={Link}
      to={`/reservations/${id}`}
    >
      <Group position="apart">
        <div>
          <Text weight={500} size="lg">
            {dayjs(since).format("DD/MM/YYYY")} -{" "}
            {dayjs(until).format("DD/MM/YYYY")}
          </Text>
          <Text>
            {guests.length}{" "}
            {guests.length > 1
              ? t("guests").toLowerCase()
              : t("guest").toLowerCase()}
          </Text>
        </div>
        {showState && (
          <Badge
            size="lg"
            color={state === ReservationState.ACTIVE ? "green" : "red"}
          >
            {t(state)}
          </Badge>
        )}
      </Group>
    </Paper>
  );
}
