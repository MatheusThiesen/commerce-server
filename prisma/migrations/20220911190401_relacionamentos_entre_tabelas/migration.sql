/*
  Warnings:

  - Added the required column `codigoMarca` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "codigoColecao" INTEGER,
ADD COLUMN     "codigoGrupo" INTEGER,
ADD COLUMN     "codigoLinha" INTEGER,
ADD COLUMN     "codigoMarca" INTEGER NOT NULL,
ADD COLUMN     "codigoSubGrupo" INTEGER,
ADD COLUMN     "corPrimariaCodigo" INTEGER,
ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "relCorProdutoId" TEXT;

-- CreateTable
CREATE TABLE "relCorProdutos" (
    "id" TEXT NOT NULL,
    "corCodigo" INTEGER NOT NULL,

    CONSTRAINT "relCorProdutos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MarcaToVendedor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MarcaToVendedor_AB_unique" ON "_MarcaToVendedor"("A", "B");

-- CreateIndex
CREATE INDEX "_MarcaToVendedor_B_index" ON "_MarcaToVendedor"("B");

-- AddForeignKey
ALTER TABLE "relCorProdutos" ADD CONSTRAINT "relCorProdutos_corCodigo_fkey" FOREIGN KEY ("corCodigo") REFERENCES "cores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_corPrimariaCodigo_fkey" FOREIGN KEY ("corPrimariaCodigo") REFERENCES "cores"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_relCorProdutoId_fkey" FOREIGN KEY ("relCorProdutoId") REFERENCES "relCorProdutos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_codigoMarca_fkey" FOREIGN KEY ("codigoMarca") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_codigoColecao_fkey" FOREIGN KEY ("codigoColecao") REFERENCES "colecoes"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_codigoLinha_fkey" FOREIGN KEY ("codigoLinha") REFERENCES "linhas"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_codigoGrupo_fkey" FOREIGN KEY ("codigoGrupo") REFERENCES "grupos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_codigoSubGrupo_fkey" FOREIGN KEY ("codigoSubGrupo") REFERENCES "subgrupos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcaToVendedor" ADD CONSTRAINT "_MarcaToVendedor_A_fkey" FOREIGN KEY ("A") REFERENCES "marcas"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MarcaToVendedor" ADD CONSTRAINT "_MarcaToVendedor_B_fkey" FOREIGN KEY ("B") REFERENCES "vendedores"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
