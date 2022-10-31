/*
  Warnings:

  - You are about to drop the column `codigoColecao` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `codigoGrupo` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `codigoLinha` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `codigoMarca` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `codigoSubGrupo` on the `produtos` table. All the data in the column will be lost.
  - Added the required column `marcaCodigo` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_codigoColecao_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_codigoGrupo_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_codigoLinha_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_codigoMarca_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_codigoSubGrupo_fkey";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "codigoColecao",
DROP COLUMN "codigoGrupo",
DROP COLUMN "codigoLinha",
DROP COLUMN "codigoMarca",
DROP COLUMN "codigoSubGrupo",
ADD COLUMN     "colecaoCodigo" INTEGER,
ADD COLUMN     "corSecundariaCodigo" INTEGER,
ADD COLUMN     "grupoCodigo" INTEGER,
ADD COLUMN     "linhaCodigo" INTEGER,
ADD COLUMN     "marcaCodigo" INTEGER NOT NULL,
ADD COLUMN     "subgrupoCodigo" INTEGER,
ALTER COLUMN "codigoAlternativo" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_marcaCodigo_fkey" FOREIGN KEY ("marcaCodigo") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_colecaoCodigo_fkey" FOREIGN KEY ("colecaoCodigo") REFERENCES "colecoes"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_linhaCodigo_fkey" FOREIGN KEY ("linhaCodigo") REFERENCES "linhas"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_grupoCodigo_fkey" FOREIGN KEY ("grupoCodigo") REFERENCES "grupos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_subgrupoCodigo_fkey" FOREIGN KEY ("subgrupoCodigo") REFERENCES "subgrupos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
