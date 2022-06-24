import { List, LoadingOverlay, Popover } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useFetcher } from "remix";
import type { LoaderData as GetReservationsType } from "../routes/reservations/getReservations";

const DateWithPopover = ({
  day,
  reservation,
}: {
  day: number;
  reservation: Reservation;
}) => {
  const [isPopoverOpened, setPopoverOpened] = useState(false);
  return (
    <Popover
      opened={isPopoverOpened}
      target={
        <div
          onMouseEnter={() => setPopoverOpened(true)}
          onMouseLeave={() => setPopoverOpened(false)}
        >
          {day}
        </div>
      }
    >
      <List>
        {reservation.guests.map((guest) => (
          <List.Item key={guest}>{guest}</List.Item>
        ))}
      </List>
    </Popover>
  );
};

export default function ReservationsCalendar() {
  const [month, setMonth] = useState(dayjs().startOf("month").toDate());
  const [initialLoading, setInitialLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 800px)", false);
  const amountOfMonths = isMobile ? 1 : 3
  const fetcher = useFetcher();

  const getReservationWithDate = (date: Date) => {
    if (fetcher?.data) {
      const { reservations } = fetcher?.data as GetReservationsType;
      return reservations.find(
        (reservation) =>
          dayjs(date).add(1, "day").isAfter(reservation.since) &&
          dayjs(date).isBefore(reservation.until)
      );
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("since", month.toISOString());
    params.set("months", amountOfMonths.toString())

    fetcher.submit(params, { action: "/reservations/getReservations" });
  }, [month]);

  useEffect(() => {
    setInitialLoading(false)
  }, [fetcher.data, setInitialLoading])

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={fetcher.state !== "idle" || initialLoading} />
      <Calendar
        dayStyle={(date) =>
          getReservationWithDate(date)
            ? {
                backgroundColor: "red",
                color: "white",
              }
            : {}
        }
        fullWidth
        amountOfMonths={amountOfMonths}
        month={month}
        onMonthChange={(month) => setMonth(month)}
        onChange={() => {}}
        renderDay={(date) => {
          const day = date.getDate();
          const reservation = getReservationWithDate(date);
          if (reservation) {
            return <DateWithPopover day={day} reservation={reservation} />;
          }
          return <div>{day}</div>;
        }}
      />
    </div>
  );
}
