/*
  Warnings:

  - A unique constraint covering the columns `[pedidoCodigo]` on the table `pedidosErp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pedidosErp" ADD COLUMN     "pedidoCodigo" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "pedidosErp_pedidoCodigo_key" ON "pedidosErp"("pedidoCodigo");

-- AddForeignKey
ALTER TABLE "pedidosErp" ADD CONSTRAINT "pedidosErp_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
