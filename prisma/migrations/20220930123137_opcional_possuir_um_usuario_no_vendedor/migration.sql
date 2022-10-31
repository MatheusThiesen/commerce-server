-- DropForeignKey
ALTER TABLE "vendedores" DROP CONSTRAINT "vendedores_usuarioId_fkey";

-- AlterTable
ALTER TABLE "vendedores" ALTER COLUMN "usuarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
