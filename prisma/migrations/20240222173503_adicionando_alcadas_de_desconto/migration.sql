/*
  Warnings:

  - You are about to drop the `Diferenciado` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('DIRETOR', 'GERENTE', 'VENDEDOR');

-- DropForeignKey
ALTER TABLE "Diferenciado" DROP CONSTRAINT "Diferenciado_pedidoCodigo_fkey";

-- DropForeignKey
ALTER TABLE "Diferenciado" DROP CONSTRAINT "Diferenciado_vendedorCodigo_fkey";

-- DropTable
DROP TABLE "Diferenciado";

-- CreateTable
CREATE TABLE "alcadasDesconto" (
    "id" TEXT NOT NULL,
    "tipoUsuario" "TipoUsuario" NOT NULL,
    "percentualAprovacao" DECIMAL(65,30) NOT NULL,
    "percentualSolicitacao" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alcadasDesconto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diferenciados" (
    "id" TEXT NOT NULL,
    "motivoDiferenciado" TEXT,
    "tipoDesconto" "TipoDescontoDiferenciado" NOT NULL,
    "percentualDesconto" INTEGER,
    "valorDesconto" INTEGER,
    "vendedorCodigo" INTEGER NOT NULL,
    "pedidoCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diferenciados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alcadasDesconto_id_key" ON "alcadasDesconto"("id");

-- CreateIndex
CREATE UNIQUE INDEX "alcadasDesconto_tipoUsuario_key" ON "alcadasDesconto"("tipoUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "diferenciados_id_key" ON "diferenciados"("id");

-- AddForeignKey
ALTER TABLE "diferenciados" ADD CONSTRAINT "diferenciados_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diferenciados" ADD CONSTRAINT "diferenciados_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
