/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `vendedores` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vendedores" DROP CONSTRAINT "vendedores_usuarioId_fkey";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "vendedorCodigo" INTEGER;

-- AlterTable
ALTER TABLE "vendedores" DROP COLUMN "usuarioId";

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
