import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { LoadingOverlay } from "@mantine/core";
import { RangeCalendar, RangeCalendarProps } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import type { LoaderData as GetReservationsType } from "../routes/reservations/getReservations";

const ReservationsCalendar: FunctionComponent<RangeCalendarProps> = (props) => {
  const isMobile = useMediaQuery("(max-width: 800px)", false);
  const amountOfMonths = isMobile ? 1 : 3;
  const fetcher = useFetcher();

  const [month, setMonth] = useState(dayjs().startOf("month").toDate());
  const [initialLoading, setInitialLoading] = useState(true);

  const getReservationWithDate = useCallback(
    (date: Date) => {
      if (fetcher?.data) {
        const { reservations } = fetcher?.data as GetReservationsType;
        const between = reservations.filter(({ since, until }) =>
          dayjs(date).hour(12).isBetween(since, until, "day")
        );
        const endOnDate = reservations.find(
          ({ until }) => dayjs(until).isSame(date, "day")
        );
        if (endOnDate) {
          const startOnEndOnDate = reservations.find(
            ({ since }) => dayjs(since).isSame(endOnDate.until, "day")
          );
          if (startOnEndOnDate) {
            return true;
          }
        }
        return !!between.length;
      }
      return false
    },
    [fetcher?.data]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("since", month.toISOString());
    params.set("months", amountOfMonths.toString());

    fetcher.submit(params, { action: "/reservations/getReservations" });
  }, [month]);

  useEffect(() => {
    setInitialLoading(false);
  }, [fetcher.data, setInitialLoading]);

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={fetcher.state !== "idle" || initialLoading} />
      <RangeCalendar
        {...props}
        excludeDate={(date) =>
          dayjs().isAfter(date, "days") || getReservationWithDate(date)
        }
        amountOfMonths={amountOfMonths}
        month={month}
        onMonthChange={(month) => setMonth(month)}
      />
    </div>
  );
};

export default ReservationsCalendar;
