/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
UPDATE "User" SET "firstName" = CONCAT("firstName"::text, ' ', "lastName"::text);
UPDATE "User" SET "firstName" = trim("firstName"::text);

ALTER TABLE "User" RENAME COLUMN "firstName" TO "name";
ALTER TABLE "User" DROP COLUMN "lastName";
