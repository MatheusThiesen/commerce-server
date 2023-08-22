/*
  Warnings:

  - You are about to drop the column `localEstoqueId` on the `pedidos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigoErp]` on the table `pedidos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodo` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_localEstoqueId_fkey";

-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "localEstoqueId",
ADD COLUMN     "codigoErp" INTEGER,
ADD COLUMN     "periodo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigoErp_key" ON "pedidos"("codigoErp");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_periodo_fkey" FOREIGN KEY ("periodo") REFERENCES "periodosEstoque"("periodo") ON DELETE RESTRICT ON UPDATE CASCADE;
