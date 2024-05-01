-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_BannerToMarca" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToMarca_AB_unique" ON "_BannerToMarca"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToMarca_B_index" ON "_BannerToMarca"("B");

-- AddForeignKey
ALTER TABLE "_BannerToMarca" ADD CONSTRAINT "_BannerToMarca_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToMarca" ADD CONSTRAINT "_BannerToMarca_B_fkey" FOREIGN KEY ("B") REFERENCES "marcas"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
