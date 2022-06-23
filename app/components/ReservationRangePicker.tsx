import { LoadingOverlay } from "@mantine/core";
import { RangeCalendar, RangeCalendarProps } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { FunctionComponent, useEffect, useState } from "react";
import { useFetcher } from "remix";
import type { LoaderData as GetReservationsType } from "../routes/reservations/getReservations";

const ReservationsCalendar: FunctionComponent<RangeCalendarProps> = (props) => {
  const [month, setMonth] = useState(dayjs().startOf("month").toDate());
  const isMobile = useMediaQuery("(max-width: 800px)", false);
  const amountOfMonths = isMobile ? 1 : 3;
  const fetcher = useFetcher();

  const getReservationWithDate = (date: Date) => {
    if (fetcher?.data) {
      const { reservations } = fetcher?.data as GetReservationsType;
      return reservations.find(
        (reservation) =>
          dayjs(date).isAfter(reservation.since) &&
          dayjs(date).add(1, "day").isBefore(reservation.until)
      );
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("since", month.toISOString());
    params.set("months", amountOfMonths.toString());

    fetcher.submit(params, { action: "/reservations/getReservations" });
  }, [month]);

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={fetcher.state !== "idle"} />
      <RangeCalendar
        {...props}
        excludeDate={(date) => dayjs().isAfter(date) || !!getReservationWithDate(date)}
        amountOfMonths={amountOfMonths}
        month={month}
        onMonthChange={(month) => setMonth(month)}
      />
    </div>
  );
};

export default ReservationsCalendar;
