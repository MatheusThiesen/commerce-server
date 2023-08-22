/*
  Warnings:

  - A unique constraint covering the columns `[listaPrecoCodigo,condicaoPagamentoCodigo,marcaCodigo]` on the table `regrasCondicaoPagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "regrasCondicaoPagamento_condicaoPagamentoCodigo_marcaCodigo_key";

-- CreateIndex
CREATE UNIQUE INDEX "regrasCondicaoPagamento_listaPrecoCodigo_condicaoPagamentoC_key" ON "regrasCondicaoPagamento"("listaPrecoCodigo", "condicaoPagamentoCodigo", "marcaCodigo");
