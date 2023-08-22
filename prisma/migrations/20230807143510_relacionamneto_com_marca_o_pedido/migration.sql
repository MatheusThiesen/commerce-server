/*
  Warnings:

  - Added the required column `marcaCodigo` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "marcaCodigo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_marcaCodigo_fkey" FOREIGN KEY ("marcaCodigo") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
