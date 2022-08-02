import { useEffect } from "react";
import type {
  ActionFunction,
  MetaFunction,
  LoaderFunction,
} from "@remix-run/node";
import i18next from "~/i18next.server";
import { useTranslation } from "react-i18next";
import { DeviceFloppy, Plus, X } from "tabler-icons-react";
import {
  Button,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import type { FormList} from "@mantine/form";
import { formList, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";

import {
  checkAvailability,
  createReservation,
} from "~/models/reservation.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import GoBackButton from "~/components/GoBackButton";
import getSinceUntil from "~/utils/getSinceUntil";
import showAvailability from "~/utils/showAvailability";
import ReservationRangePicker from "~/components/ReservationRangePicker";
import UserAutocomplete from "~/components/UserAutocomplete";

export type NewReservationFormValues = {
  stay: FormList<Date>;
  arrival: Date;
  leave: Date;
  guests: FormList<{ name: string; email?: string; key: string }>;
};

const newReservationDefaultValues: Omit<NewReservationFormValues, "guests"> = {
  stay: formList([new Date(), dayjs().add(1, "day").toDate()]),
  arrival: dayjs().hour(10).minute(0).toDate(),
  leave: dayjs().hour(16).minute(0).toDate(),
};

type MakeReservationErrorData = {
  errors?: {
    date?: string;
    guests?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const userId = await requireUserId(request);
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

  const reservation = await createReservation({
    since: new Date(since),
    until: new Date(until),
    guests: JSON.parse(guests),
    userId,
  });

  return redirect(`/reservations/${reservation.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const t = await i18next.getFixedT(request, "common");
  const title = t("newReservation");
  return json({ title });
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: data.title,
  };
};

export default function NewReservationPage() {
  const actionData = useActionData() as MakeReservationErrorData;
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const user = useUser();
  const form = useForm<NewReservationFormValues>({
    initialValues: {
      ...newReservationDefaultValues,
      guests: formList([
        {
          name: user.name,
          email: user.email,
          key: randomId(),
        },
      ]),
    },
  });

  const handleAddGuest = (event: any) => {
    // event.preventDefault();
    form.addListItem("guests", { name: "", email: "", key: randomId() });
  };

  const handleRemoveGuest = (event: any, index: number) => {
    // event.preventDefault();
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
      form.values.guests
        ?.filter(({ name }) => name)
        .map(({ name, email }) => ({ name, email }))
    );

    const formData = new FormData();
    formData.set("since", since.toISOString());
    formData.set("until", until.toISOString());
    formData.set("guests", guests);

    submit(formData, { method: "post" });
  };

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

  const availability = showAvailability(fetcher);

  return (
    <Form onSubmit={handleSubmit}>
      <Stack>
        <GoBackButton />
        <Title order={5}>{t("lengthOfStay")}</Title>
        <Group>
          <Text weight={500}>
            {t("pickDatesLabel")}
            <span style={{ color: "red" }}> *</span>
          </Text>
          <ReservationRangePicker
            {...form.getInputProps("stay")}
            style={{ flexGrow: 1 }}
            fullWidth
          />
          {actionData?.errors?.date && (
            <Text color="red">{actionData?.errors?.date}</Text>
          )}
          <Group>
            <TimeInput
              {...form.getInputProps("arrival")}
              required
              label={t("arrival")}
              clearable
            />
            <TimeInput
              {...form.getInputProps("leave")}
              required
              label={t("leave")}
              clearable
            />
          </Group>
        </Group>

        <Text color={availability.color} align="right">
          {t(availability.message)}
        </Text>

        <Title order={5}>{t("guests")}</Title>
        <Stack spacing="xs" align="stretch">
          {form.values.guests.map((item, index) => (
            <Group key={item.key}>
              <UserAutocomplete form={form} index={index} />
              <Button
                style={{ alignSelf: "flex-end" }}
                color="red"
                onClick={(event: any) => handleRemoveGuest(event, index)}
                type="button"
              >
                <X />
              </Button>
            </Group>
          ))}
        </Stack>

        <Group position="center">
          <Button leftIcon={<Plus />} onClick={handleAddGuest} type="button">
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
