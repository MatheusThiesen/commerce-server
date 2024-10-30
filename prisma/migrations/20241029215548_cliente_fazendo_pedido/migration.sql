-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "eCriadoPeloCliente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ePendente" BOOLEAN NOT NULL DEFAULT false;
