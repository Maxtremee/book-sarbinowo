import { renderToStaticMarkup } from "react-dom/server";
import sendMail from "./sendMail";
import { getReservationsInXDays } from "~/models/reservation.server";
import logger from "~/logger";

export default function sendReminders(
  reservations: Awaited<ReturnType<typeof getReservationsInXDays>>,
  inDays = 1
) {
  const emailsToSend = reservations.map((reservation) => {
    const to = reservation.user.email;
    const subject = `Sarbinowo: Twoja rezerwacja zaczyna się za ${inDays} ${
      inDays > 1 ? "dni" : "dzień"
    }! 🎉`;
    const content = (
      <>
        <h3>Przypominamy o nadchodzącej rezerwacji</h3>
        <h5>Długość pobytu</h5>
        <p>
          Od: {reservation.since.toLocaleString("pl")} <br />
          Do: {reservation.until.toLocaleString("pl")}
        </p>
        <h5>Goście</h5>
        <ul>
          {reservation.guests.map((guest) => (
            <li key={guest}>{guest}</li>
          ))}
        </ul>
        <a
          href={`http${process.env.NODE_ENV === "production" && "s"}://${
            process.env.BASE_URL
          }/reservations/${reservation.id}`}
          target="_blank"
        >
          Kliknij tutaj aby zobaczyć rezerwację w aplikacji
        </a>
      </>
    );
    return { to, subject, html: renderToStaticMarkup(content) };
  });
  logger.info(
    `Sending ${emailsToSend.length} emails about reservations starting in ${inDays} days`
  );
  sendMail(emailsToSend);
}
