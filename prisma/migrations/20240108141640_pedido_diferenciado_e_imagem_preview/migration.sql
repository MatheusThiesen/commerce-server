-- CreateEnum
CREATE TYPE "TipoDescontoDiferenciado" AS ENUM ('VALOR', 'PERCENTUAL');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "eDiferenciado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "percentualDesconto" INTEGER,
ADD COLUMN     "tipoDesconto" "TipoDescontoDiferenciado",
ADD COLUMN     "valorDesconto" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "imagemPreview" TEXT;

-- CreateTable
CREATE TABLE "Diferenciado" (
    "id" TEXT NOT NULL,
    "motivoDiferenciado" TEXT,
    "tipoDesconto" "TipoDescontoDiferenciado" NOT NULL,
    "percentualDesconto" INTEGER,
    "valorDesconto" INTEGER,
    "vendedorCodigo" INTEGER NOT NULL,
    "pedidoCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diferenciado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Diferenciado_id_key" ON "Diferenciado"("id");

-- CreateIndex
CREATE INDEX "produtos_marcaCodigo_idx" ON "produtos"("marcaCodigo");

-- CreateIndex
CREATE INDEX "produtos_generoCodigo_idx" ON "produtos"("generoCodigo");

-- CreateIndex
CREATE INDEX "produtos_colecaoCodigo_idx" ON "produtos"("colecaoCodigo");

-- AddForeignKey
ALTER TABLE "Diferenciado" ADD CONSTRAINT "Diferenciado_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diferenciado" ADD CONSTRAINT "Diferenciado_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
