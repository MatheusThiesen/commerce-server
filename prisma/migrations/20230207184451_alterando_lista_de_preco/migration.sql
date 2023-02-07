/*
  Warnings:

  - You are about to drop the `Tamanhos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tamanhos" DROP CONSTRAINT "Tamanhos_gradeCodigo_fkey";

-- DropTable
DROP TABLE "Tamanhos";

-- CreateTable
CREATE TABLE "listasPreco" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "produtoCodigo" INTEGER NOT NULL,

    CONSTRAINT "listasPreco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tamanhos" (
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradeCodigo" INTEGER,

    CONSTRAINT "tamanhos_pkey" PRIMARY KEY ("descricao")
);

-- CreateIndex
CREATE UNIQUE INDEX "listasPreco_id_key" ON "listasPreco"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tamanhos_descricao_key" ON "tamanhos"("descricao");

-- AddForeignKey
ALTER TABLE "listasPreco" ADD CONSTRAINT "listasPreco_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tamanhos" ADD CONSTRAINT "tamanhos_gradeCodigo_fkey" FOREIGN KEY ("gradeCodigo") REFERENCES "grades"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
