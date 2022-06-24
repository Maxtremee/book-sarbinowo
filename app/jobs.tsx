import { scheduleJob } from "node-schedule";
import sendReminders from "~/email/sendReminders";
import { getReservationsInXDays } from "~/models/reservation.server";

export default function jobs() {
  console.log("Initiating schedules");
  scheduleJob({ hour: 2 }, async () => {
    const in1Day = await getReservationsInXDays(1);
    sendReminders(in1Day);
    const in3Days = await getReservationsInXDays(3);
    sendReminders(in3Days, 3);
    const in7Days = await getReservationsInXDays(7);
    sendReminders(in7Days, 7);
  });
}
