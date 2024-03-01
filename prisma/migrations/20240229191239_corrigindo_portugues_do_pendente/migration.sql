/*
  Warnings:

  - You are about to drop the column `vendedorPendeteDiferenciadoCodigo` on the `pedidos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_vendedorPendeteDiferenciadoCodigo_fkey";

-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "vendedorPendeteDiferenciadoCodigo",
ADD COLUMN     "vendedorPendenteDiferenciadoCodigo" INTEGER;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedorPendenteDiferenciadoCodigo_fkey" FOREIGN KEY ("vendedorPendenteDiferenciadoCodigo") REFERENCES "vendedores"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
