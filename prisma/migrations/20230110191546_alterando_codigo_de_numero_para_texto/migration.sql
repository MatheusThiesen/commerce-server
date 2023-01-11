/*
  Warnings:

  - The primary key for the `ordensCompra` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ordensCompra" DROP CONSTRAINT "ordensCompra_pkey",
ALTER COLUMN "codigo" SET DATA TYPE TEXT,
ADD CONSTRAINT "ordensCompra_pkey" PRIMARY KEY ("codigo");
