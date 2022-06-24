import sgMail, { MailDataRequired } from "@sendgrid/mail";

const key = process.env.SENDGRID_API_KEY || "";
const sender = process.env.SENDER || "";

sgMail.setApiKey(key);

export default async function sendMail(
  to: string,
  subject: string,
  html: string
) {
  const message: MailDataRequired = {
    from: sender,
    to,
    subject,
    html,
    mailSettings: {
      sandboxMode: {
        enable: process.env.NODE_ENV !== "production",
      },
    },
  };
  try {
    await sgMail.send(message);
  } catch (error) {
    console.log(error);
  }
}
