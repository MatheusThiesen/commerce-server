/*
  Warnings:

  - You are about to drop the `RegrasCondicaoPagamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegrasCondicaoPagamento" DROP CONSTRAINT "RegrasCondicaoPagamento_marcaCodigo_fkey";

-- DropTable
DROP TABLE "RegrasCondicaoPagamento";

-- CreateTable
CREATE TABLE "regrasCondicaoPagamento" (
    "id" TEXT NOT NULL,
    "valorMinimo" DOUBLE PRECISION NOT NULL DEFAULT 9999999,
    "listaPrecoCodigo" INTEGER NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "marcaCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regrasCondicaoPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regrasCondicaoPagamento_id_key" ON "regrasCondicaoPagamento"("id");

-- AddForeignKey
ALTER TABLE "regrasCondicaoPagamento" ADD CONSTRAINT "regrasCondicaoPagamento_marcaCodigo_fkey" FOREIGN KEY ("marcaCodigo") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
