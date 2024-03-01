/*
  Warnings:

  - Added the required column `hierarquia` to the `alcadasDesconto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alcadasDesconto" ADD COLUMN     "hierarquia" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "diferenciados" ADD COLUMN     "eFinalizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passo" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "eDiferenciadoFinalizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vendedorPendeteDiferenciadoCodigo" INTEGER;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedorPendeteDiferenciadoCodigo_fkey" FOREIGN KEY ("vendedorPendeteDiferenciadoCodigo") REFERENCES "vendedores"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
