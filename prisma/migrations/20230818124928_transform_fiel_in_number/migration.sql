/*
  Warnings:

  - Changed the type of `numeroDocumento` on the `titulos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "titulos" DROP COLUMN "numeroDocumento",
ADD COLUMN     "numeroDocumento" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "titulos_numeroDocumento_desdobramento_clienteCodigo_key" ON "titulos"("numeroDocumento", "desdobramento", "clienteCodigo");
