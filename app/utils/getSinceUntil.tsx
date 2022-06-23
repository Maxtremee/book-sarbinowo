import dayjs from "dayjs";

export default function getSinceUntil (arrivalHour: Date, leaveHour: Date, stay: Date[]) {
  const arrival = dayjs(arrivalHour);
  const leave = dayjs(leaveHour);

  const since = dayjs(stay[0])
    .hour(arrival.hour())
    .minute(arrival.minute())
    .second(0);
  const until = dayjs(stay[1])
    .hour(leave.hour())
    .minute(leave.minute())
    .second(0);
  return { since, until };
};