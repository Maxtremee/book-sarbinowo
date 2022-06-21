import { useState } from "react";
import {
  Group,
  ListItem,
  Modal,
  Text,
  Title,
  List,
  Divider,
  Stack,
  Button,
  Tooltip,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import type { Reservation } from "~/models/reservation.server";
import { getReservation, cancelReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";
import GoBackButton from "~/components/GoBackButton";
import { useTranslation } from "react-i18next";
import { Settings, X } from "tabler-icons-react";

type LoaderData = {
  reservation: Reservation;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservation not found");

  const reservation = await getReservation({
    userId,
    id: params.reservationId,
  });
  if (!reservation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ reservation });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservation not found");

  await cancelReservation({ userId, id: params.reservationId });

  return redirect("/reservations");
};

export default function ReservationDetailsPage() {
  const { t } = useTranslation();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { reservation } = useLoaderData() as LoaderData;
  const since = dayjs(reservation.since);
  const until = dayjs(reservation.until);
  const created = dayjs(reservation.createdAt);
  const updated = dayjs(reservation.updatedAt);
  const { guests } = reservation;

  return (
    <>
      <Group noWrap={false} align="start" position="left" spacing="xl">
        <Calendar
          initialMonth={since.toDate()}
          dayStyle={(date) =>
            dayjs(date).isAfter(dayjs(since).subtract(1, "day")) &&
            dayjs(date).isBefore(dayjs(until))
              ? { backgroundColor: "red", color: "white" }
              : {}
          }
        />
        <Stack>
          <div>
            <Title order={3}>
              {t("since")}: {since.toDate().toLocaleString()}
            </Title>
            <Title order={3}>
              {t("until")}: {until.toDate().toLocaleString()}
            </Title>
          </div>
          <Text>{t("guests")}:</Text>
          <List withPadding>
            {guests?.map((guest) => (
              <ListItem key={guest}>{guest}</ListItem>
            ))}
          </List>
        </Stack>

        <div>
          <Text>
            {t("created")}: {created.toDate().toLocaleString()}
          </Text>
          <Text>
            {t("updated")}: {updated.toDate().toLocaleString()}
          </Text>
        </div>
      </Group>
      <Divider
        sx={(theme) => ({
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.md,
        })}
      />
      <Group>
        <GoBackButton />
        {until.isAfter(dayjs()) && (
          <Tooltip label={t("notImplementedMessage")} withArrow>
            <Button
              disabled={true}
              leftIcon={<Settings />}
              color="yellow"
              // component={Link}
              // to={`/reservations/change/${reservation.id}`}
            >
              {t("change")}
            </Button>
          </Tooltip>
        )}
        <Button
          leftIcon={<X />}
          color="red"
          onClick={() => setCancelOpen(true)}
        >
          {t("cancel")}
        </Button>
      </Group>
      <Modal
        opened={cancelOpen}
        onClose={() => setCancelOpen(false)}
        withCloseButton={false}
        title={t("cancelReservationConfirm")}
      >
        <Group position="center">
          <Button onClick={() => setCancelOpen(false)}>{t("no")}</Button>
          <Form method="post">
            <Button color="red" type="submit">
              {t("yes")}
            </Button>
          </Form>
        </Group>
      </Modal>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Reservation not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
