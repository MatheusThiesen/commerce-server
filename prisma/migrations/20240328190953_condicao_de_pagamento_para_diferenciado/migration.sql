/*
  Warnings:

  - Made the column `pedidoCodigo` on table `registros` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "registros" DROP CONSTRAINT "registros_pedidoCodigo_fkey";

-- AlterTable
ALTER TABLE "registros" ALTER COLUMN "pedidoCodigo" SET NOT NULL;

-- AlterTable
ALTER TABLE "regrasCondicaoPagamento" ADD COLUMN     "eApenasDiferenciado" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "registros" ADD CONSTRAINT "registros_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
