import { renderToStaticMarkup } from "react-dom/server";
import sendMail from "./sendMail";
import type { getReservationsInXDays } from "~/models/reservation.server";
import logger from "~/logger";

export default function sendReminders(
  reservations: Awaited<ReturnType<typeof getReservationsInXDays>>,
  inDays = 1
) {
  const emailsToSend: Array<{ to: string; subject: string; html: string }> = [];
  reservations.forEach((reservation) => {
    return reservation.guests.forEach((guest) => {
      if (guest.email) {
        const to = guest.email;
        const subject = `Sarbinowo: Twoja rezerwacja zaczyna się za ${inDays} ${
          inDays > 1 ? "dni" : "dzień"
        }! 🎉`;
        const content = (
          <div>
            <h3>Przypominamy o nadchodzącej rezerwacji</h3>
            <h5>Długość pobytu</h5>
            <p>
              Od: {reservation.since.toLocaleString("pl")} <br />
              Do: {reservation.until.toLocaleString("pl")}
            </p>
            <h5>Goście</h5>
            <ul>
              {reservation.guests.map((guest) => (
                <li key={guest.name}>{guest.name}</li>
              ))}
            </ul>
            <a
              href={`http${process.env.NODE_ENV === "production" && "s"}://${
                process.env.BASE_URL
              }/reservations/${reservation.id}`}
              target="_blank" rel="noreferrer"
            >
              Kliknij tutaj aby zobaczyć rezerwację w aplikacji
            </a>
          </div>
        );
        emailsToSend.push({ to, subject, html: renderToStaticMarkup(content) });
      }
    });
  });
  logger.info(
    `Sending ${emailsToSend.length} emails about reservations starting in ${inDays} days`
  );
  sendMail(emailsToSend.flat());
}
