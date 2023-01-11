/*
  Warnings:

  - You are about to drop the column `descricao` on the `ordensCompra` table. All the data in the column will be lost.
  - Added the required column `nome` to the `ordensCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ordensCompra" DROP COLUMN "descricao",
ADD COLUMN     "nome" TEXT NOT NULL;
