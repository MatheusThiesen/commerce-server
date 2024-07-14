-- CreateTable
CREATE TABLE "_ClienteToVendedor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BannerToProduto" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClienteToVendedor_AB_unique" ON "_ClienteToVendedor"("A", "B");

-- CreateIndex
CREATE INDEX "_ClienteToVendedor_B_index" ON "_ClienteToVendedor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToProduto_AB_unique" ON "_BannerToProduto"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToProduto_B_index" ON "_BannerToProduto"("B");

-- AddForeignKey
ALTER TABLE "_ClienteToVendedor" ADD CONSTRAINT "_ClienteToVendedor_A_fkey" FOREIGN KEY ("A") REFERENCES "clientes"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClienteToVendedor" ADD CONSTRAINT "_ClienteToVendedor_B_fkey" FOREIGN KEY ("B") REFERENCES "vendedores"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToProduto" ADD CONSTRAINT "_BannerToProduto_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToProduto" ADD CONSTRAINT "_BannerToProduto_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
