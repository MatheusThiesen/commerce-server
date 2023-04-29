/*
  Warnings:

  - Added the required column `cidade` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "cidadeIbgeCod" INTEGER;
