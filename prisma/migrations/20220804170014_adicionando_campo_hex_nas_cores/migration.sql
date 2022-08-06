/*
  Warnings:

  - Added the required column `hex` to the `cores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cores" ADD COLUMN     "hex" TEXT NOT NULL;
