/*
  Warnings:

  - A unique constraint covering the columns `[pedidoCodigo,produtoCodigo,sequencia]` on the table `itensPedido` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequencia` to the `itensPedido` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "itensPedido_pedidoCodigo_produtoCodigo_key";

-- AlterTable
ALTER TABLE "itensPedido" ADD COLUMN     "sequencia" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "itensPedido_pedidoCodigo_produtoCodigo_sequencia_key" ON "itensPedido"("pedidoCodigo", "produtoCodigo", "sequencia");
