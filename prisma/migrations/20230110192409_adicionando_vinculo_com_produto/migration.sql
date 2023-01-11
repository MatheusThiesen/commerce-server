/*
  Warnings:

  - Added the required column `produtoCodigo` to the `ordensCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ordensCompra" ADD COLUMN     "produtoCodigo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ordensCompra" ADD CONSTRAINT "ordensCompra_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
