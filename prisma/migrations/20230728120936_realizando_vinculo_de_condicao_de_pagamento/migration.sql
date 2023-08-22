/*
  Warnings:

  - Added the required column `concicaoPagamentoCodigo` to the `regrasCondicaoPagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "regrasCondicaoPagamento" ADD COLUMN     "concicaoPagamentoCodigo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "regrasCondicaoPagamento" ADD CONSTRAINT "regrasCondicaoPagamento_concicaoPagamentoCodigo_fkey" FOREIGN KEY ("concicaoPagamentoCodigo") REFERENCES "condicoesPagamento"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
