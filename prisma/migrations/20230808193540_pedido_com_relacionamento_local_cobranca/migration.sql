/*
  Warnings:

  - Added the required column `localCobrancaCodigo` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "localCobrancaCodigo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_localCobrancaCodigo_fkey" FOREIGN KEY ("localCobrancaCodigo") REFERENCES "locaisCobranca"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
