/*
  Warnings:

  - You are about to drop the column `eClient` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "eClient",
ADD COLUMN     "eCliente" BOOLEAN NOT NULL DEFAULT false;
