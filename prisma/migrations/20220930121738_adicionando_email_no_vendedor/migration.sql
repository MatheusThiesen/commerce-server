/*
  Warnings:

  - Added the required column `email` to the `vendedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vendedores" ADD COLUMN     "email" TEXT NOT NULL;
