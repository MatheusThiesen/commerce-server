/*
  Warnings:

  - You are about to drop the column `eVenda` on the `listasPreco` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[produtoCodigo,codigo]` on the table `listasPreco` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "listasPreco" DROP COLUMN "eVenda";

-- CreateIndex
CREATE UNIQUE INDEX "listasPreco_produtoCodigo_codigo_key" ON "listasPreco"("produtoCodigo", "codigo");
