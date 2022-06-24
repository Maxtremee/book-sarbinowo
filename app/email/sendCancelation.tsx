import { renderToStaticMarkup } from "react-dom/server";
import { Reservation, User } from "@prisma/client";
import sendMail from "./sendMail";

export default async function sendCancelation(
  reservation: Reservation,
  user: User
) {
  const to = user.email;
  const subject = "Sarbinowo: Twoja rezerwacja została anulowana ❌ ";
  const content = (
    <>
      <h3>Dane anulowanej rezerwacji</h3>
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
    </>
  );
  sendMail([{to, subject, html: renderToStaticMarkup(content)}]);
}
