import type { User, Reservation, Guest } from "@prisma/client";
import { ReservationState } from "@prisma/client";
import dayjs from "dayjs";

import { prisma } from "~/db.server";
import sendCancelation from "~/email/sendCancelation";
import sendConfirmation from "~/email/sendConfirmation";

export type { Reservation, ReservationState, Guest } from "@prisma/client";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  return prisma.reservation.findFirst({
    where: { id, userId },
    include: {
      user: true,
      guests: true,
    },
  });
}

export function getUserReservations({ userId }: { userId: User["id"] }) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { since: "desc" },
    include: {
      guests: true,
    },
  });
}

export function getUserTotalReservations({
  userId,
  canceled = false,
}: {
  userId: User["id"];
  canceled?: boolean;
}) {
  return prisma.reservation.count({
    where: {
      userId,
      state: {
        equals: canceled ? undefined : ReservationState.ACTIVE,
      },
    },
  });
}

export function getUserReservationsOffset({
  userId,
  amount = 10,
  offset = 0,
  canceled = false,
}: {
  userId: User["id"];
  amount?: number;
  offset?: number;
  canceled?: boolean;
}) {
  return prisma.reservation.findMany({
    skip: offset,
    take: amount,
    where: {
      userId,
      state: {
        equals: canceled ? undefined : ReservationState.ACTIVE,
      },
    },
    orderBy: { since: "desc" },
    include: {
      guests: true,
    },
  });
}

export async function createReservation({
  since,
  until,
  guests,
  userId,
}: Pick<Reservation, "since" | "until"> & { guests: Guest[] } & {
  userId: User["id"];
}) {
  const newReservation = await prisma.reservation.create({
    data: {
      since,
      until,
      guests: {
        createMany: {
          data: guests,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      user: true,
      guests: true,
    },
  });
  sendConfirmation(newReservation);
  return newReservation;
}

export async function updateReservation({
  id,
  since,
  until,
  guests,
  userId,
}: Pick<Reservation, "id" | "since" | "until"> & { guests: Guest[] } & {
  userId: User["id"];
}) {
  const old = await prisma.reservation.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      guests: true,
    },
  });

  if (old) {
    return prisma.reservation.update({
      where: {
        id,
      },
      data: {
        since,
        until,
        guests: {
          deleteMany: old.guests,
          createMany: {
            data: guests,
          },
        },
      },
    });
  }
}

export async function cancelReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) {
  const oldReservation = await getReservation({ id, userId });
  if (oldReservation && oldReservation.state !== "CANCELED") {
    sendCancelation(oldReservation);
  }
  return prisma.reservation.updateMany({
    where: { id, userId },
    data: {
      state: ReservationState.CANCELED,
    },
  });
}

export async function checkAvailability({
  since,
  until,
}: Pick<Reservation, "since" | "until">) {
  const range = `[${dayjs(since).format("YYYY-MM-DD")}, ${dayjs(until).format(
    "YYYY-MM-DD"
  )})`;
  const res = await prisma.$queryRawUnsafe<{ id: string }[] | []>(
    `SELECT DISTINCT id FROM public."Reservation" WHERE state = 'ACTIVE' AND daterange(DATE(since), DATE(until)) && daterange '${range}' LIMIT 1`
  );
  return !res.length;
}

export async function checkCurrentOccupant() {
  const today = new Date();
  return prisma.reservation.findFirst({
    where: {
      since: {
        lte: today,
      },
      until: {
        gte: today,
      },
      state: {
        equals: ReservationState.ACTIVE,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function getReservationsSinceThroughXMonths(
  since: Date,
  months = 3
) {
  const sinceAdjusted = dayjs(since).subtract(7, "days").toDate();
  const until = dayjs(since).add(months, "months").add(7, "days").toDate();
  return prisma.reservation.findMany({
    where: {
      since: {
        lte: until,
      },
      until: {
        gte: sinceAdjusted,
      },
      state: {
        equals: ReservationState.ACTIVE,
      },
    },
    include: {
      guests: true,
    },
  });
}

export async function getUsersClosestReservation(userId: User["id"]) {
  return prisma.reservation.findFirst({
    where: {
      userId,
      since: {
        gte: new Date(),
      },
      state: {
        equals: ReservationState.ACTIVE,
      },
    },
    orderBy: {
      since: "asc",
    },
    include: {
      guests: true,
    },
  });
}

export async function getReservationsInXDays(days: number) {
  const inDays = dayjs().add(days, "days").toDate();
  const inDaysPlusOne = dayjs(inDays).add(1, "day").toDate();
  return prisma.reservation.findMany({
    where: {
      since: {
        gte: inDays,
        lte: inDaysPlusOne,
      },
      state: {
        equals: ReservationState.ACTIVE,
      },
    },
    include: {
      guests: true
    },
  });
}

export async function getUsersFromPreviousReservations({
  userId,
  searchStr,
  limit,
}: {
  userId: User["id"];
  searchStr: string;
  limit: number;
}) {
  const guests = await prisma.reservation.findMany({
    where: {
      userId,
      guests: {
        some: {
          name: {
            contains: searchStr,
            mode: "insensitive",
          },
        },
      },
    },
    take: limit || 3,
    select: {
      guests: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
  return guests.flatMap(({ guests }) => guests);
}
