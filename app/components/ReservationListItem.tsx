import { Text } from "@mantine/core";
import { Reservation } from "@prisma/client";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";

export default function ReservationListItem({
  id,
  since,
  until,
  state,
  guests,
}: Reservation) {
  return (
    <Link
      className={`block rounded-md border border-transparent text-blue-500 p-4 mt-4 drop-shadow-md hover:bg-blue-50 ${
        state === "CANCELED" && "bg-red-600 hover:bg-red-400 text-black"
      }`}
      to={id}
    >
      <Text weight={500} size="lg" className="text-inherit">
        {dayjs(since).format("DD/MM/YYYY")}-{dayjs(until).format("DD/MM/YYYY")}
      </Text>
      <Text>{guests.length} {guests.length > 1 ? "guests" : "guest"}</Text>
    </Link>
  );
}
