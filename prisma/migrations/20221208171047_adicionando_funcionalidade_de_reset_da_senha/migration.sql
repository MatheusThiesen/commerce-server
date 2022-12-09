-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "senhaResetExpira" TIMESTAMP(3),
ADD COLUMN     "senhaResetToken" TEXT;

-- CreateTable
CREATE TABLE "ordensCompra" (
    "codigo" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordensCompra_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "codigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "itensPedido" (
    "codigo" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitaro" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "sitiacao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pedidoCodigo" INTEGER,
    "produtoCodigo" INTEGER,

    CONSTRAINT "itensPedido_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordensCompra_codigo_key" ON "ordensCompra"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigo_key" ON "pedidos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "itensPedido_codigo_key" ON "itensPedido"("codigo");

-- AddForeignKey
ALTER TABLE "itensPedido" ADD CONSTRAINT "itensPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedido" ADD CONSTRAINT "itensPedido_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
