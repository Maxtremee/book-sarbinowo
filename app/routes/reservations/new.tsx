import {
  Group,
  Text,
  TextInput,
} from "@mantine/core";
import { DateRangePicker, TimeInput } from "@mantine/dates";
import { formList, useForm, zodResolver } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { z } from "zod";

import { createReservation } from "~/models/reservation.server";
import { requireUserId } from "~/session.server";

const reservationSchema = z.object({
  stay: z
    .array(z.date(), z.date())
    .length(2)
    .nonempty({ message: "You need to specify stay date range" }),
  arrival: z.date().optional(),
  leave: z.date().optional(),
  guests: z
    .array(z.string())
    .nonempty({ message: "At least one guest is required" }),
});

type ActionData = {
  errors?: {
    since?: string;
    until?: string;
    guests?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const since = formData.get("since");
  const until = formData.get("until");
  const arrival = formData.get("arrival") as string;
  const leave = formData.get("leave") as string;
  const guests = formData.get("guests");

  if (typeof since !== "string" || new Date(since) < new Date()) {
    return json<ActionData>(
      { errors: { since: "Since date is required" } },
      { status: 400 }
    );
  }

  if (typeof until !== "string" || new Date(until) < new Date()) {
    return json<ActionData>(
      { errors: { until: "Until date is required" } },
      { status: 400 }
    );
  }

  if (typeof guests !== "string" || !guests) {
    return json<ActionData>(
      { errors: { until: "Guest list is required" } },
      { status: 400 }
    );
  }

  const reservation = await createReservation({
    since: new Date(since),
    until: new Date(until),
    guests: JSON.parse(guests),
    arrival: arrival ? new Date(arrival) : null,
    leave: leave ? new Date(leave) : null,
    userId,
  });

  return redirect(`/reservations/${reservation.id}`);
};

export default function NewNotePage() {
  const submit = useSubmit();

  const form = useForm({
    initialValues: {
      stay: formList([
        dayjs().add(1, "day").toDate(),
        dayjs().add(8, "day").toDate(),
      ]),
      arrival: null,
      leave: null,
      guests: formList([{ name: "", key: randomId() }]),
    },
    schema: zodResolver(reservationSchema),
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

    const since = dayjs(form.values.stay[0]).startOf('day');
    const until = dayjs(form.values.stay[1]).startOf('day');
    const guests = JSON.stringify(
      form.values.guests.filter(({ name }) => name).map(({ name }) => name)
    );

    const formData = new FormData();

    formData.set("since", since.toISOString());
    formData.set("until", until.toISOString());

    if (form.values.arrival !== null) {
      const arrival = dayjs(form.values.arrival)
        .set("year", since.day())
        .set("month", since.month())
        .set("year", since.year());
      formData.set("arrival", arrival.toISOString());
    }
    if (form.values.leave !== null) {
      const leave = dayjs(form.values.leave)
        .set("year", until.day())
        .set("month", until.month())
        .set("year", until.year());
      formData.set("leave", leave.toISOString());
    }
    if (form.values.guests.length > 0) {
      formData.set("guests", guests);
    }

    submit(formData, { method: "post" });
  };

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4"
    >
      <Group mb="xs">
        <Text weight={500}>Length of stay</Text>
      </Group>
      <Group>
        <DateRangePicker
          required
          label="Pick dates range"
          className="grow"
          {...form.getInputProps("stay")}
        />
        <TimeInput
          label="Arrival time"
          clearable
          {...form.getInputProps("arrival")}
        />
        <TimeInput
          label="Leave time"
          clearable
          {...form.getInputProps("leave")}
        />
      </Group>
      <Text>Apartment available:</Text>
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
              {...form.getListInputProps("guests", index, "name")}
            />
            <button
              className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
              onClick={(event) => handleRemoveGuest(event, index)}
            >
              Delete
            </button>
          </Group>
        ))}

        <Group position="center" mt="md">
          <button
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            onClick={handleAddGuest}
          >
            + Add guest
          </button>
        </Group>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
