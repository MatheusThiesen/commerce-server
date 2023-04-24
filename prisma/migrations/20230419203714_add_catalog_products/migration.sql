-- CreateTable
CREATE TABLE "catalogosProduto" (
    "id" TEXT NOT NULL,
    "qtdAcessos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "catalogosProduto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CatalogoProdutoToProduto" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogosProduto_id_key" ON "catalogosProduto"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_CatalogoProdutoToProduto_AB_unique" ON "_CatalogoProdutoToProduto"("A", "B");

-- CreateIndex
CREATE INDEX "_CatalogoProdutoToProduto_B_index" ON "_CatalogoProdutoToProduto"("B");

-- AddForeignKey
ALTER TABLE "catalogosProduto" ADD CONSTRAINT "catalogosProduto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CatalogoProdutoToProduto" ADD CONSTRAINT "_CatalogoProdutoToProduto_A_fkey" FOREIGN KEY ("A") REFERENCES "catalogosProduto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CatalogoProdutoToProduto" ADD CONSTRAINT "_CatalogoProdutoToProduto_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
