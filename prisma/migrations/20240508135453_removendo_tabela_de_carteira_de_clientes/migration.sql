/*
  Warnings:

  - You are about to drop the `cateirasClieteRepresentante` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cateirasClieteRepresentante" DROP CONSTRAINT "cateirasClieteRepresentante_clienteCodigo_fkey";

-- DropForeignKey
ALTER TABLE "cateirasClieteRepresentante" DROP CONSTRAINT "cateirasClieteRepresentante_vendedorCodigo_fkey";

-- DropTable
DROP TABLE "cateirasClieteRepresentante";
