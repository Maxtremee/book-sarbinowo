import { renderToStaticMarkup } from "react-dom/server";
import sendMail from "./sendMail";
import type { getReservation } from "~/models/reservation.server";

export default async function sendConfirmation(
  reservation: Awaited<ReturnType<typeof getReservation>>
) {
  if (reservation) {
    const to = reservation.user.email;
    const subject = "Sarbinowo: Twoja rezerwacja została potwierdzona ✅ ";
    const content = (
      <>
        <h5>Długość pobytu</h5>
        <p>
          Od: {reservation.since.toLocaleString("pl")} <br />
          Do: {reservation.until.toLocaleString("pl")}
        </p>
        <h5>Goście</h5>
        <ul>
          {reservation.guests.map(({ name }) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <a
          href={`http${process.env.NODE_ENV === "production" && "s"}://${
            process.env.BASE_URL
          }/reservations/${reservation.id}`}
          target="_blank"
          rel="noreferrer"
        >
          Kliknij tutaj aby zobaczyć rezerwację w aplikacji
        </a>
      </>
    );
    sendMail([{ to, subject, html: renderToStaticMarkup(content) }]);
  }
}
