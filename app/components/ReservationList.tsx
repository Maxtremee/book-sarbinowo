import { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import ReservationListItem from "./ReservationListItem";

export default function ReservationList({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const { t } = useTranslation();
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
      <p className="font-bold">{t("upcoming")}</p>

      {upcoming.length === 0 ? (
        <p className="p-4">{t("noUpcoming")}</p>
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
      <p className="font-bold">{t("current")}</p>

      {current.length === 0 ? (
        <p className="p-4">{t("noCurrent")}</p>
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
      <p className="font-bold">{t("previous")}</p>

      {previous.length === 0 ? (
        <p className="p-4">{t("noPrevious")}</p>
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
