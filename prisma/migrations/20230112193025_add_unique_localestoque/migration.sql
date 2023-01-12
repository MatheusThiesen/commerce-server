/*
  Warnings:

  - A unique constraint covering the columns `[periodo,produtoCodigo]` on the table `locaisEstoque` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "locaisEstoque_periodo_produtoCodigo_key" ON "locaisEstoque"("periodo", "produtoCodigo");
