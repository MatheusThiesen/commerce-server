/*
  Warnings:

  - You are about to drop the column `grupoCodigo` on the `subgrupos` table. All the data in the column will be lost.
  - Added the required column `codigoGrupo` to the `subgrupos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subgrupos" DROP CONSTRAINT "subgrupos_grupoCodigo_fkey";

-- AlterTable
ALTER TABLE "subgrupos" DROP COLUMN "grupoCodigo",
ADD COLUMN     "codigoGrupo" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subgrupos" ADD CONSTRAINT "subgrupos_codigoGrupo_fkey" FOREIGN KEY ("codigoGrupo") REFERENCES "grupos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
