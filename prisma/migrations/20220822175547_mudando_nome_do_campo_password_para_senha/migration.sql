/*
  Warnings:

  - You are about to drop the column `password` on the `vendedores` table. All the data in the column will be lost.
  - Added the required column `senha` to the `vendedores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senhaRefresh` to the `vendedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vendedores" DROP COLUMN "password",
ADD COLUMN     "senha" TEXT NOT NULL,
ADD COLUMN     "senhaRefresh" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "produtos" (
    "codigo" INTEGER NOT NULL,
    "codigoAlternativo" INTEGER NOT NULL,
    "referencia" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoComplementar" TEXT NOT NULL,
    "precoVenda" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");
