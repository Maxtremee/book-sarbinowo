/*
  Warnings:

  - You are about to drop the `Guest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_reservationId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "guests" TEXT[];

-- DropTable
DROP TABLE "Guest";
