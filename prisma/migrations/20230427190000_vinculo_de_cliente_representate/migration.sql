/*
  Warnings:

  - You are about to drop the `_ClienteToVendedor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClienteToVendedor" DROP CONSTRAINT "_ClienteToVendedor_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClienteToVendedor" DROP CONSTRAINT "_ClienteToVendedor_B_fkey";

-- DropTable
DROP TABLE "_ClienteToVendedor";

-- CreateTable
CREATE TABLE "CarteiraClienteRepresentante" (
    "id" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendedorCodigo" INTEGER NOT NULL,
    "clienteCodigo" INTEGER NOT NULL,

    CONSTRAINT "CarteiraClienteRepresentante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarteiraClienteRepresentante_id_key" ON "CarteiraClienteRepresentante"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CarteiraClienteRepresentante_vendedorCodigo_clienteCodigo_key" ON "CarteiraClienteRepresentante"("vendedorCodigo", "clienteCodigo");

-- AddForeignKey
ALTER TABLE "CarteiraClienteRepresentante" ADD CONSTRAINT "CarteiraClienteRepresentante_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarteiraClienteRepresentante" ADD CONSTRAINT "CarteiraClienteRepresentante_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
