/*
  Warnings:

  - You are about to drop the `RegrasProdutoConceito` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegrasProdutoConceito" DROP CONSTRAINT "RegrasProdutoConceito_conceitoCodigo_fkey";

-- DropForeignKey
ALTER TABLE "RegrasProdutoConceito" DROP CONSTRAINT "RegrasProdutoConceito_subGrupoId_fkey";

-- DropTable
DROP TABLE "RegrasProdutoConceito";

-- CreateTable
CREATE TABLE "regrasProdutoConceito" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subGrupoId" TEXT NOT NULL,
    "conceitoCodigo" INTEGER NOT NULL,

    CONSTRAINT "regrasProdutoConceito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regrasProdutoConceito_id_key" ON "regrasProdutoConceito"("id");

-- CreateIndex
CREATE UNIQUE INDEX "regrasProdutoConceito_subGrupoId_conceitoCodigo_key" ON "regrasProdutoConceito"("subGrupoId", "conceitoCodigo");

-- AddForeignKey
ALTER TABLE "regrasProdutoConceito" ADD CONSTRAINT "regrasProdutoConceito_subGrupoId_fkey" FOREIGN KEY ("subGrupoId") REFERENCES "subgrupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regrasProdutoConceito" ADD CONSTRAINT "regrasProdutoConceito_conceitoCodigo_fkey" FOREIGN KEY ("conceitoCodigo") REFERENCES "conceitos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
