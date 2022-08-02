import type { MailDataRequired } from "@sendgrid/mail";
import sgMail from "@sendgrid/mail";
import logger from "~/logger";

const key = process.env.SENDGRID_API_KEY || "";
const sender = process.env.SENDER || "";

sgMail.setApiKey(key);

export type MailContent = {
  to: string;
  subject: string;
  html: string;
};

export default async function sendMail(mail: MailContent[]) {
  const adjustedMail = mail.map(
    (mail) =>
      ({
        ...mail,
        from: sender,
        mailSettings: {
          sandboxMode: {
            enable: process.env.NODE_ENV !== "production",
          },
        },
      } as MailDataRequired)
  );
  try {
    await sgMail.send(adjustedMail);
  } catch (error) {
    logger.error(error);
  }
}
