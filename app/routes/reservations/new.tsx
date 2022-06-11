import { useEffect, useState } from "react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Button, Group, Text, TextInput } from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";
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

type MakeReservationErrorData = {
  errors?: {
    date?: string;
    guests?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const since = formData.get("since");
  const until = formData.get("until");
  const guests = formData.get("guests");

  if (typeof since !== "string") {
    return json<MakeReservationErrorData>(
      { errors: { date: "Since date is required" } },
      { status: 400 }
    );
  }

  if (dayjs(since) < dayjs().startOf("day")) {
    return json<MakeReservationErrorData>(
      { errors: { date: "Start of stay cannot be earlier than today" } },
      { status: 400 }
    );
  }

  if (typeof until !== "string") {
    return json<MakeReservationErrorData>(
      { errors: { date: "Until date is required" } },
      { status: 400 }
    );
  }

  if (dayjs(until) < dayjs().add(1, "day")) {
    return json<MakeReservationErrorData>(
      { errors: { date: "End of stay cannot be earlier than tommorrow" } },
      { status: 400 }
    );
  }

  if (!checkAvailability({ since: new Date(since), until: new Date(until) })) {
    return json<MakeReservationErrorData>(
      { errors: { date: "The apartment is booked during this time" } },
      { status: 400 }
    );
  }

  if (typeof guests !== "string" || !guests) {
    return json<MakeReservationErrorData>(
      { errors: { guests: "At least one guest is required" } },
      { status: 400 }
    );
  }

  if (new Array(JSON.parse(guests)).length < 1) {
    return json<MakeReservationErrorData>(
      { errors: { guests: "At least one guest is required" } },
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

export const meta: MetaFunction = () => {
  return {
    title: "New reservation",
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

interface Availability {
  message: string;
  color: string;
}

const showAvailability = (fetcher: any): Availability => {
  switch (fetcher.state) {
    case "submitting":
      return {
        message: "Checking availability...",
        color: "text-yellow-400",
      };
    case "idle":
      return fetcher.data?.isAvailable
        ? { message: "Apartment is available", color: "text-green-400" }
        : {
            message:
              "Apartment is occupied during this time. Try with different dates",
            color: "text-red-400",
          };
    default:
      return { message: "", color: "" };
  }
};

export default function NewNotePage() {
  const actionData = useActionData() as MakeReservationErrorData;
  const fetcher = useFetcher();
  const submit = useSubmit();
  const user = useUser();
  const form = useForm({
    initialValues: {
      stay: formList([new Date(), dayjs().add(7, "day").toDate()]),
      arrival: dayjs().hour(10).minute(0).toDate(),
      leave: dayjs().hour(16).minute(0).toDate(),
      guests: formList([
        {
          name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
          key: randomId(),
        },
      ]),
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
    <Form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {/* <div className="flex items-start gap-3"></div> */}
      <Group>
        <GoBackButton />
      </Group>
      <Group mb="xs">
        <Text weight={500}>Length of stay</Text>
      </Group>
      <Group>
        <DateRangePicker
          required
          label="Pick dates range"
          amountOfMonths={2}
          className="grow"
          error={actionData?.errors?.date}
          excludeDate={(date) => date < dayjs().subtract(1, "day").toDate()}
          {...form.getInputProps("stay")}
        />
        <TimeInput
          required
          label="Arrival time"
          clearable
          {...form.getInputProps("arrival")}
        />
        <TimeInput
          required
          label="Leave time"
          clearable
          {...form.getInputProps("leave")}
        />
      </Group>

      <Text className={`${availability.color} text-right`}>
        {availability.message}
      </Text>

      <div>
        <Group mb="xs">
          <Text weight={500}>Guests</Text>
        </Group>

        {form.values.guests.map((item, index) => (
          <Group key={item.key} mt="xs">
            <TextInput
              required
              className="grow"
              placeholder="John Doe"
              error={actionData?.errors?.guests}
              {...form.getListInputProps("guests", index, "name")}
            />
            <Button
              className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
              onClick={(event: any) => handleRemoveGuest(event, index)}
            >
              Delete
            </Button>
          </Group>
        ))}

        <Group position="center" mt="md">
          <Button
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            onClick={handleAddGuest}
          >
            + Add guest
          </Button>
        </Group>
      </div>

      <Group position="center" mt="md">
        <Button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          disabled={!fetcher.data?.isAvailable || form.values.guests.length < 1}
        >
          Save
        </Button>
      </Group>
    </Form>
  );
}
