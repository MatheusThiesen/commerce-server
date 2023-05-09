/*
  Warnings:

  - You are about to drop the column `query` on the `catalogosProduto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "catalogosProduto" DROP COLUMN "query",
ADD COLUMN     "filtro" TEXT;
