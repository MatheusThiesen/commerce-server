/*
  Warnings:

  - You are about to drop the column `percentualDesconto` on the `diferenciados` table. All the data in the column will be lost.
  - You are about to drop the column `valorDesconto` on the `diferenciados` table. All the data in the column will be lost.
  - You are about to drop the column `percentualDesconto` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `valorDesconto` on the `pedidos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "diferenciados" DROP COLUMN "percentualDesconto",
DROP COLUMN "valorDesconto",
ADD COLUMN     "descontoPercentual" DOUBLE PRECISION,
ADD COLUMN     "descontoValor" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "percentualDesconto",
DROP COLUMN "valorDesconto",
ADD COLUMN     "descontoPercentual" DOUBLE PRECISION,
ADD COLUMN     "descontoValor" DOUBLE PRECISION;
