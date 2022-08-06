/*
  Warnings:

  - Added the required column `grupoCodigo` to the `subgrupos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "subgrupos" ADD COLUMN     "eAtivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "grupoCodigo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subgrupos" ADD CONSTRAINT "subgrupos_grupoCodigo_fkey" FOREIGN KEY ("grupoCodigo") REFERENCES "grupos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
