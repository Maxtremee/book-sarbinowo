import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { List, LoadingOverlay, Popover, useMantineTheme } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { Guest } from "@prisma/client";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import type { LoaderData as GetReservationsType } from "../routes/api/reservations/get";
dayjs.extend(isBetween);

const DateWithPopover = ({
  day,
  guests,
}: {
  day: number;
  guests: Guest[];
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
        {guests.map(({name}) => (
          <List.Item key={name}>{name}</List.Item>
        ))}
      </List>
    </Popover>
  );
};

export default function ReservationsCalendar() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(
    `(max-width: ${theme.breakpoints.sm}px)`,
    false
  );
  const amountOfMonths = isMobile ? 1 : 3;
  const fetcher = useFetcher();

  const [month, setMonth] = useState(dayjs().startOf("month").toDate());
  const [initialLoading, setInitialLoading] = useState(true);

  const getReservationWithDate = useCallback(
    (date: Date) => {
      if (fetcher?.data) {
        const { reservations } = fetcher?.data as GetReservationsType;
        return reservations.find(({ since, until }) =>
          dayjs(date).isBetween(since, until, "day", "[]")
        );
      }
    },
    [fetcher?.data]
  );

  const getDayStyle = useCallback(
    (date: Date) =>
      getReservationWithDate(date)
        ? {
            backgroundColor: "red",
            color: "white",
          }
        : {},
    [getReservationWithDate]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("since", month.toISOString());
    params.set("months", amountOfMonths.toString());

    fetcher.submit(params, { action: "/api/reservations/get" });
  }, [month]);

  useEffect(() => {
    setInitialLoading(false);
  }, [fetcher.data, setInitialLoading]);

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={fetcher.state !== "idle" || initialLoading} />
      <Calendar
        dayStyle={getDayStyle}
        fullWidth
        amountOfMonths={amountOfMonths}
        month={month}
        onMonthChange={(month) => setMonth(month)}
        onChange={() => {}}
        renderDay={(date) => {
          const day = date.getDate();
          const reservation = getReservationWithDate(date);
          if (reservation) {
            return <DateWithPopover day={day} guests={reservation.guests} />;
          }
          return <div>{day}</div>;
        }}
      />
    </div>
  );
}
