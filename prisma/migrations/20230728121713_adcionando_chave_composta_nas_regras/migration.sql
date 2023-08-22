/*
  Warnings:

  - A unique constraint covering the columns `[concicaoPagamentoCodigo,marcaCodigo,listaPrecoCodigo]` on the table `regrasCondicaoPagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "regrasCondicaoPagamento_concicaoPagamentoCodigo_marcaCodigo_key" ON "regrasCondicaoPagamento"("concicaoPagamentoCodigo", "marcaCodigo", "listaPrecoCodigo");
