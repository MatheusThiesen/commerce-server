/*
  Warnings:

  - You are about to drop the column `bloqueiosVendedorId` on the `grupos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "grupos" DROP CONSTRAINT "grupos_bloqueiosVendedorId_fkey";

-- AlterTable
ALTER TABLE "grupos" DROP COLUMN "bloqueiosVendedorId";

-- CreateTable
CREATE TABLE "_BloqueiosVendedorToGrupo" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BloqueiosVendedorToGrupo_AB_unique" ON "_BloqueiosVendedorToGrupo"("A", "B");

-- CreateIndex
CREATE INDEX "_BloqueiosVendedorToGrupo_B_index" ON "_BloqueiosVendedorToGrupo"("B");

-- AddForeignKey
ALTER TABLE "_BloqueiosVendedorToGrupo" ADD CONSTRAINT "_BloqueiosVendedorToGrupo_A_fkey" FOREIGN KEY ("A") REFERENCES "bloqueiosVendedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosVendedorToGrupo" ADD CONSTRAINT "_BloqueiosVendedorToGrupo_B_fkey" FOREIGN KEY ("B") REFERENCES "grupos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
