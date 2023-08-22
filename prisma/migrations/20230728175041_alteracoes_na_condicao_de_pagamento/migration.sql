/*
  Warnings:

  - Added the required column `quantidade` to the `condicoesPagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "condicoesPagamento" ADD COLUMN     "quantidade" INTEGER NOT NULL,
ADD COLUMN     "valorMinimo" DOUBLE PRECISION NOT NULL DEFAULT 9999999;

-- CreateTable
CREATE TABLE "condicaoPagamentoParcelas" (
    "id" TEXT NOT NULL,
    "tabelaPreco" INTEGER NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "condicaoPagamentoCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condicaoPagamentoParcelas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "condicaoPagamentoParcelas_id_key" ON "condicaoPagamentoParcelas"("id");

-- AddForeignKey
ALTER TABLE "condicaoPagamentoParcelas" ADD CONSTRAINT "condicaoPagamentoParcelas_condicaoPagamentoCodigo_fkey" FOREIGN KEY ("condicaoPagamentoCodigo") REFERENCES "condicoesPagamento"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
