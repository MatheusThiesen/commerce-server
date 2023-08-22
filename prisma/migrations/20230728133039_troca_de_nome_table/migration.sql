/*
  Warnings:

  - You are about to drop the column `concicaoPagamentoCodigo` on the `regrasCondicaoPagamento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[condicaoPagamentoCodigo,marcaCodigo,listaPrecoCodigo]` on the table `regrasCondicaoPagamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `condicaoPagamentoCodigo` to the `regrasCondicaoPagamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "regrasCondicaoPagamento" DROP CONSTRAINT "regrasCondicaoPagamento_concicaoPagamentoCodigo_fkey";

-- DropIndex
DROP INDEX "regrasCondicaoPagamento_concicaoPagamentoCodigo_marcaCodigo_key";

-- AlterTable
ALTER TABLE "regrasCondicaoPagamento" DROP COLUMN "concicaoPagamentoCodigo",
ADD COLUMN     "condicaoPagamentoCodigo" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "regrasCondicaoPagamento_condicaoPagamentoCodigo_marcaCodigo_key" ON "regrasCondicaoPagamento"("condicaoPagamentoCodigo", "marcaCodigo", "listaPrecoCodigo");

-- AddForeignKey
ALTER TABLE "regrasCondicaoPagamento" ADD CONSTRAINT "regrasCondicaoPagamento_condicaoPagamentoCodigo_fkey" FOREIGN KEY ("condicaoPagamentoCodigo") REFERENCES "condicoesPagamento"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
