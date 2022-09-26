/*
  Warnings:

  - You are about to drop the column `relCorProdutoId` on the `produtos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigoProduto]` on the table `relCorProdutos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_relCorProdutoId_fkey";

-- AlterTable
ALTER TABLE "colecoes" ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "linhas" ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "relCorProdutoId";

-- AlterTable
ALTER TABLE "relCorProdutos" ADD COLUMN     "codigoProduto" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "relCorProdutos_codigoProduto_key" ON "relCorProdutos"("codigoProduto");

-- AddForeignKey
ALTER TABLE "relCorProdutos" ADD CONSTRAINT "relCorProdutos_codigoProduto_fkey" FOREIGN KEY ("codigoProduto") REFERENCES "produtos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
