import { User, Reservation, ReservationState, Role } from "@prisma/client";

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
  arrival,
  leave,
  guests,
  userId,
}: Pick<Reservation, "since" | "until" | "arrival" | "leave" | "guests"> & {
  userId: User["id"];
}) {
  return prisma.reservation.create({
    data: {
      since,
      until,
      arrival,
      leave,
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
  arrival,
  leave,
  guests,
  userId,
}: Pick<
  Reservation,
  "id" | "since" | "until" | "arrival" | "leave" | "guests"
> & {
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
      arrival,
      leave,
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
  arrival,
  leave,
  guests,
}: Pick<
  Reservation,
  "id" | "since" | "until" | "arrival" | "leave" | "guests"
>) {
  return prisma.reservation.update({
    where: {
      id,
    },
    data: {
      since,
      until,
      arrival,
      leave,
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
