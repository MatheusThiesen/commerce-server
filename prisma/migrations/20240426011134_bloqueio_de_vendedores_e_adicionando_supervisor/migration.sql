-- AlterEnum
ALTER TYPE "TipoUsuario" ADD VALUE 'SUPERVISOR';

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "bloqueiosVendedorId" TEXT;

-- AlterTable
ALTER TABLE "periodosEstoque" ADD COLUMN     "bloqueiosVendedorId" TEXT;

-- CreateTable
CREATE TABLE "bloqueiosVendedor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendedorCodigo" INTEGER NOT NULL,

    CONSTRAINT "bloqueiosVendedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bloqueiosVendedor_vendedorCodigo_key" ON "bloqueiosVendedor"("vendedorCodigo");

-- AddForeignKey
ALTER TABLE "bloqueiosVendedor" ADD CONSTRAINT "bloqueiosVendedor_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_bloqueiosVendedorId_fkey" FOREIGN KEY ("bloqueiosVendedorId") REFERENCES "bloqueiosVendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodosEstoque" ADD CONSTRAINT "periodosEstoque_bloqueiosVendedorId_fkey" FOREIGN KEY ("bloqueiosVendedorId") REFERENCES "bloqueiosVendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
