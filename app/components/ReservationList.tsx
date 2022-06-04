import { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const upcoming = reservations.filter(({ since }) =>
    dayjs(since).isAfter(dayjs())
  );
  const current = reservations.filter(
    ({ since, until }) =>
      dayjs(until).isAfter(dayjs()) && dayjs(since).isBefore(dayjs())
  );
  const previous = reservations.filter(({ until }) =>
    dayjs(until).isBefore(dayjs())
  );
  return (
    <>
      <p className="font-bold">Upcoming</p>

      {upcoming.length === 0 ? (
        <p className="p-4">No upcoming reservations</p>
      ) : (
        <ol>
          {upcoming.map((reservation) => (
            <li key={reservation.id}>
              <ReservationListItem {...reservation} />
            </li>
          ))}
        </ol>
      )}
      <hr className="my-4" />
      <p className="font-bold">Current</p>

      {current.length === 0 ? (
        <p className="p-4">No current reservations</p>
      ) : (
        <ol>
          {current.map((reservation) => (
            <li key={reservation.id}>
              <ReservationListItem {...reservation} />
            </li>
          ))}
        </ol>
      )}
      <hr className="my-4" />
      <p className="font-bold">Previous</p>

      {previous.length === 0 ? (
        <p className="p-4">No previous reservations</p>
      ) : (
        <ol>
          {previous.map((reservation) => (
            <li key={reservation.id}>
              <ReservationListItem {...reservation} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
