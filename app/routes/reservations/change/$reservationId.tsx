import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";
import { formList, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DeviceFloppy, Plus, X } from "tabler-icons-react";
import invariant from "tiny-invariant";
import GoBackButton from "~/components/GoBackButton";
import i18next from "~/i18next.server";
import {
  checkAvailability,
  Reservation,
  updateReservation,
} from "~/models/reservation.server";
import { getReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  reservation: Reservation;
  title: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("modifyReservation");

  const userId = await requireUserId(request);
  invariant(params.reservationId, "reservation not found");

  const reservation = await getReservation({
    userId,
    id: params.reservationId,
  });
  if (!reservation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ reservation, title });
};

type MakeReservationErrorData = {
  errors?: {
    date?: string;
    guests?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const t = await i18next.getFixedT(request, "common");
  const userId = await requireUserId(request);
  const reservationId = params.reservationId as string;
  const formData = await request.formData();
  const since = formData.get("since");
  const until = formData.get("until");
  const guests = formData.get("guests");

  if (typeof since !== "string") {
    return json<MakeReservationErrorData>(
      { errors: { date: t("sinceDateRequired") } },
      { status: 400 }
    );
  }

  if (dayjs(since) < dayjs().startOf("day")) {
    return json<MakeReservationErrorData>(
      { errors: { date: t("startEarlierError") } },
      { status: 400 }
    );
  }

  if (typeof until !== "string") {
    return json<MakeReservationErrorData>(
      { errors: { date: t("untilDateRequired") } },
      { status: 400 }
    );
  }

  if (!checkAvailability({ since: new Date(since), until: new Date(until) })) {
    return json<MakeReservationErrorData>(
      { errors: { date: t("apartmentOccupied") } },
      { status: 400 }
    );
  }

  if (typeof guests !== "string" || !guests) {
    return json<MakeReservationErrorData>(
      { errors: { guests: t("onGuestRequired") } },
      { status: 400 }
    );
  }

  if (new Array(JSON.parse(guests)).length < 1) {
    return json<MakeReservationErrorData>(
      { errors: { guests: t("onGuestRequired") } },
      { status: 400 }
    );
  }

  await updateReservation({
    id: reservationId,
    since: new Date(since),
    until: new Date(until),
    guests: JSON.parse(guests),
    userId,
  });

  return redirect(`/reservations/${reservationId}`);
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data.title,
  };
};

const getSinceUntil = (arrivalHour: Date, leaveHour: Date, stay: Date[]) => {
  const arrival = dayjs(arrivalHour);
  const leave = dayjs(leaveHour);

  const since = dayjs(stay[0])
    .hour(arrival.hour())
    .minute(arrival.minute())
    .second(0);
  const until = dayjs(stay[1])
    .hour(leave.hour())
    .minute(leave.minute())
    .second(0);
  return { since, until };
};

const showAvailability = (fetcher: any): { message: string; color: string } => {
  switch (fetcher.state) {
    case "submitting":
      return {
        message: "checkingAvailability",
        color: "yellow",
      };
    case "idle":
      return fetcher.data?.isAvailable
        ? { message: "apartmentAvailable", color: "green" }
        : {
            message: "apartmentOccupied",
            color: "red",
          };
    default:
      return { message: "", color: "" };
  }
};

export default function NewNotePage() {
  const { t } = useTranslation();
  const actionData = useActionData() as MakeReservationErrorData;
  const { reservation } = useLoaderData() as LoaderData;
  const fetcher = useFetcher();
  const submit = useSubmit();
  const form = useForm({
    initialValues: {
      stay: formList([
        new Date(reservation.since),
        new Date(reservation.until),
      ]),
      arrival: new Date(reservation.since),
      leave: new Date(reservation.until),
      guests: formList(
        reservation.guests.map((guest) => ({ name: guest, key: randomId() }))
      ),
    },
  });

  const handleAddGuest = (event: any) => {
    event.preventDefault();
    form.addListItem("guests", { name: "", key: randomId() });
  };

  const handleRemoveGuest = (event: any, index: number) => {
    event.preventDefault();
    form.removeListItem("guests", index);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    const { since, until } = getSinceUntil(
      form.values.arrival,
      form.values.leave,
      form.values.stay
    );

    const guests = JSON.stringify(
      form.values.guests.filter(({ name }) => name).map(({ name }) => name)
    );

    const formData = new FormData();
    formData.set("since", since.toISOString());
    formData.set("until", until.toISOString());
    formData.set("guests", guests);

    submit(formData, { method: "post" });
  };

  const availability = showAvailability(fetcher);

  // check availability
  useEffect(() => {
    if (form.values.stay[0] && form.values.stay[1]) {
      const { since, until } = getSinceUntil(
        form.values.arrival,
        form.values.leave,
        form.values.stay
      );

      const params = new URLSearchParams();
      params.set("since", since.toISOString());
      params.set("until", until.toISOString());

      fetcher.submit(params, { action: "/reservations/isAvailable" });
    }
  }, [form.values.stay]);

  return (
    <Form onSubmit={handleSubmit}>
      <Stack>
        <GoBackButton />
        <Text weight={500}>{t("lengthOfStay")}</Text>
        <Group>
          <DateRangePicker
            style={{ flexGrow: 1 }}
            required
            label={t("pickDatesLabel")}
            amountOfMonths={2}
            error={actionData?.errors?.date}
            excludeDate={(date) => date < dayjs().subtract(1, "day").toDate()}
            {...form.getInputProps("stay")}
          />
          <Group>
            <TimeInput
              required
              label={t("arrival")}
              clearable
              {...form.getInputProps("arrival")}
            />
            <TimeInput
              required
              label={t("leave")}
              clearable
              {...form.getInputProps("leave")}
            />
          </Group>
        </Group>

        <Text color={availability.color} align="right">
          {t(availability.message)}
        </Text>

        <Text weight={500}>{t("guests")}</Text>

        <Stack spacing="xs" align="stretch">
          {form.values.guests.map((item, index) => (
            <Group key={item.key}>
              <TextInput
                style={{ flexGrow: 1 }}
                required
                placeholder={t("guestNamePlaceholder")}
                error={actionData?.errors?.guests}
                {...form.getListInputProps("guests", index, "name")}
              />
              <Button
                leftIcon={<X />}
                color="red"
                onClick={(event: any) => handleRemoveGuest(event, index)}
              >
                {t("delete")}
              </Button>
            </Group>
          ))}
        </Stack>

        <Group position="center">
          <Button leftIcon={<Plus />} onClick={handleAddGuest}>
            {t("addGuest")}
          </Button>
        </Group>

        <Group position="center">
          <Button
            leftIcon={<DeviceFloppy />}
            type="submit"
            disabled={
              !fetcher.data?.isAvailable || form.values.guests.length < 1
            }
          >
            {t("save")}
          </Button>
        </Group>
      </Stack>
    </Form>
  );
}
