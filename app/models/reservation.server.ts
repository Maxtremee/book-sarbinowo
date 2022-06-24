import type { User, Reservation } from "@prisma/client";
import { ReservationState } from "@prisma/client";
import dayjs from "dayjs";

import { prisma } from "~/db.server";
import sendCancelation from "~/email/sendCancelation";
import sendConfirmation from "~/email/sendConfirmation";

export type { Reservation, ReservationState } from "@prisma/client";

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
    },
  });
}

export function getUserReservations({ userId }: { userId: User["id"] }) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { since: "desc" },
  });
}

export async function createReservation({
  since,
  until,
  guests,
  userId,
}: Pick<Reservation, "since" | "until" | "guests"> & {
  userId: User["id"];
}) {
  const newReservation = await prisma.reservation.create({
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
    include: {
      user: true,
    },
  });
  sendConfirmation(newReservation, newReservation.user);
  return newReservation;
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

export async function cancelReservation({
  id,
  userId,
}: Pick<Reservation, "id"> & { userId: User["id"] }) {
  const oldReservation = await getReservation({ id, userId });
  if (oldReservation && oldReservation.state !== "CANCELED") {
    sendCancelation(oldReservation, oldReservation.user);
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

export async function getReservationsSince(since: Date, months = 3) {
  const until = dayjs(since).add(months, "months").toDate();
  return prisma.reservation.findMany({
    where: {
      since: {
        lte: until,
      },
      until: {
        gte: since,
      },
      state: {
        equals: ReservationState.ACTIVE,
      },
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
