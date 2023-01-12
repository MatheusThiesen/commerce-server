/*
  Warnings:

  - Added the required column `situacao` to the `ordensCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFaturamento` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ordensCompra" ADD COLUMN     "situacao" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "dataFaturamento" TIMESTAMP(3) NOT NULL;
