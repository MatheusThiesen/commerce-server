/*
  Warnings:

  - You are about to drop the column `subgrupoCodigo` on the `produtos` table. All the data in the column will be lost.
  - The primary key for the `subgrupos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `subgrupos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo,codigoGrupo]` on the table `subgrupos` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `subgrupos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_subgrupoCodigo_fkey";

-- DropIndex
DROP INDEX "subgrupos_codigo_key";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "subgrupoCodigo",
ADD COLUMN     "subGrupoId" TEXT;

-- AlterTable
ALTER TABLE "subgrupos" DROP CONSTRAINT "subgrupos_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "subgrupos_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "subgrupos_id_key" ON "subgrupos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subgrupos_codigo_codigoGrupo_key" ON "subgrupos"("codigo", "codigoGrupo");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_subGrupoId_fkey" FOREIGN KEY ("subGrupoId") REFERENCES "subgrupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
