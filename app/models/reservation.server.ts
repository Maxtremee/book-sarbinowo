import type { User, Reservation} from "@prisma/client";
import { ReservationState } from "@prisma/client";
import dayjs from "dayjs";

import { prisma } from "~/db.server";

export type { Reservation, ReservationState } from "@prisma/client";

export function getReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & {
  userId: User["id"];
}) {
  return prisma.reservation.findFirst({
    where: { id, userId },
  });
}

export function getUserReservations({ userId }: { userId: User["id"] }) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { since: "desc" },
  });
}

export function createReservation({
  since,
  until,
  guests,
  userId,
}: Pick<Reservation, "since" | "until" | "guests"> & {
  userId: User["id"];
}) {
  return prisma.reservation.create({
    data: {
      since,
      until,
      guests,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateReservation({
  id,
  since,
  until,
  guests,
  userId,
}: Pick<Reservation, "id" | "since" | "until" | "guests"> & {
  userId: User["id"];
}) {
  return prisma.reservation.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      since,
      until,
      guests,
    },
  });
}

export function cancelReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) {
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
        gte: today
      },
      state: {
        equals: ReservationState.ACTIVE
      }
    },
    include: {
      user: true
    }
  });
}

// Admin methods

export function getAllReservations() {
  return prisma.reservation.findMany({
    orderBy: { since: "desc" },
  });
}

export function getAdminReservation({ id }: Pick<Reservation, "id">) {
  return prisma.reservation.findFirst({
    where: { id },
  });
}

export function adminUpdateReservation({
  id,
  since,
  until,
  guests,
}: Pick<Reservation, "id" | "since" | "until" | "guests">) {
  return prisma.reservation.update({
    where: {
      id,
    },
    data: {
      since,
      until,
      guests,
    },
  });
}

export function adminCancelReservation({ id }: Pick<Reservation, "id">) {
  return prisma.reservation.updateMany({
    where: { id },
    data: {
      state: ReservationState.CANCELED,
    },
  });
}
