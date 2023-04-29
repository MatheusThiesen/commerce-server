/*
  Warnings:

  - You are about to drop the column `unidadeMedidaUnidade` on the `produtos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_unidadeMedidaUnidade_fkey";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "unidadeMedidaUnidade",
ADD COLUMN     "unidadeMedida" TEXT;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_unidadeMedida_fkey" FOREIGN KEY ("unidadeMedida") REFERENCES "unidadesMedida"("unidade") ON DELETE SET NULL ON UPDATE CASCADE;
