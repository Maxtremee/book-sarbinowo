/*
  Warnings:

  - You are about to drop the column `arrival` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `leave` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "arrival",
DROP COLUMN "leave";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" SET DEFAULT E'User';
