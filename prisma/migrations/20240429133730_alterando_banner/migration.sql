/*
  Warnings:

  - The primary key for the `arquivos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filtro` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `isGroupProduct` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `ordernar` on the `banners` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "banners" DROP CONSTRAINT "banners_imagemDesktopId_fkey";

-- DropForeignKey
ALTER TABLE "banners" DROP CONSTRAINT "banners_imagemMobileId_fkey";

-- AlterTable
ALTER TABLE "arquivos" DROP CONSTRAINT "arquivos_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "arquivos_id_seq";

-- AlterTable
ALTER TABLE "banners" DROP COLUMN "filtro",
DROP COLUMN "isGroupProduct",
DROP COLUMN "ordernar",
ADD COLUMN     "url" TEXT,
ALTER COLUMN "imagemDesktopId" SET DATA TYPE TEXT,
ALTER COLUMN "imagemMobileId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_BannerToPeriodoEstoque" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BannerToGrupo" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BannerToGenero" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BannerToLinha" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BannerToColecao" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToPeriodoEstoque_AB_unique" ON "_BannerToPeriodoEstoque"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToPeriodoEstoque_B_index" ON "_BannerToPeriodoEstoque"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToGrupo_AB_unique" ON "_BannerToGrupo"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToGrupo_B_index" ON "_BannerToGrupo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToGenero_AB_unique" ON "_BannerToGenero"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToGenero_B_index" ON "_BannerToGenero"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToLinha_AB_unique" ON "_BannerToLinha"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToLinha_B_index" ON "_BannerToLinha"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BannerToColecao_AB_unique" ON "_BannerToColecao"("A", "B");

-- CreateIndex
CREATE INDEX "_BannerToColecao_B_index" ON "_BannerToColecao"("B");

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_imagemDesktopId_fkey" FOREIGN KEY ("imagemDesktopId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_imagemMobileId_fkey" FOREIGN KEY ("imagemMobileId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToPeriodoEstoque" ADD CONSTRAINT "_BannerToPeriodoEstoque_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToPeriodoEstoque" ADD CONSTRAINT "_BannerToPeriodoEstoque_B_fkey" FOREIGN KEY ("B") REFERENCES "periodosEstoque"("periodo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToGrupo" ADD CONSTRAINT "_BannerToGrupo_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToGrupo" ADD CONSTRAINT "_BannerToGrupo_B_fkey" FOREIGN KEY ("B") REFERENCES "grupos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToGenero" ADD CONSTRAINT "_BannerToGenero_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToGenero" ADD CONSTRAINT "_BannerToGenero_B_fkey" FOREIGN KEY ("B") REFERENCES "generos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToLinha" ADD CONSTRAINT "_BannerToLinha_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToLinha" ADD CONSTRAINT "_BannerToLinha_B_fkey" FOREIGN KEY ("B") REFERENCES "linhas"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToColecao" ADD CONSTRAINT "_BannerToColecao_A_fkey" FOREIGN KEY ("A") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannerToColecao" ADD CONSTRAINT "_BannerToColecao_B_fkey" FOREIGN KEY ("B") REFERENCES "colecoes"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
