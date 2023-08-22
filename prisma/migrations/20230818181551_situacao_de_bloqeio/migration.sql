/*
  Warnings:

  - You are about to drop the column `eVenda` on the `bloqueiosMarca` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bloqueiosMarca" DROP COLUMN "eVenda",
ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true;
