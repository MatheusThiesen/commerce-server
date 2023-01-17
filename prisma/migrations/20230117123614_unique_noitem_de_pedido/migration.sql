/*
  Warnings:

  - A unique constraint covering the columns `[pedidoCodigo,produtoCodigo]` on the table `itensPedido` will be added. If there are existing duplicate values, this will fail.
  - Made the column `pedidoCodigo` on table `itensPedido` required. This step will fail if there are existing NULL values in that column.
  - Made the column `produtoCodigo` on table `itensPedido` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "itensPedido" DROP CONSTRAINT "itensPedido_pedidoCodigo_fkey";

-- DropForeignKey
ALTER TABLE "itensPedido" DROP CONSTRAINT "itensPedido_produtoCodigo_fkey";

-- AlterTable
ALTER TABLE "itensPedido" ALTER COLUMN "pedidoCodigo" SET NOT NULL,
ALTER COLUMN "produtoCodigo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "itensPedido_pedidoCodigo_produtoCodigo_key" ON "itensPedido"("pedidoCodigo", "produtoCodigo");

-- AddForeignKey
ALTER TABLE "itensPedido" ADD CONSTRAINT "itensPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedido" ADD CONSTRAINT "itensPedido_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
