-- CreateEnum
CREATE TYPE "TipoVendedor" AS ENUM ('Representante', 'Vendedor', 'Televendas', 'Preposto');

-- AlterTable
ALTER TABLE "vendedores" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "tipoVendedor" "TipoVendedor" NOT NULL DEFAULT 'Representante';

-- CreateTable
CREATE TABLE "produtoEans" (
    "id" TEXT NOT NULL,
    "ean" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "tamanho" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "produtoCodigo" INTEGER NOT NULL,

    CONSTRAINT "produtoEans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidosErp" (
    "codigo" SERIAL NOT NULL,
    "dataFaturamento" TIMESTAMP(3) NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidosErp_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "itensPedidoErp" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "sequencia" INTEGER,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "motivoRecusaCodigo" INTEGER,
    "motivoCancelamentoCodigo" INTEGER,
    "produtoCodigo" INTEGER NOT NULL,
    "pedidoErpCodigo" INTEGER NOT NULL,
    "itemPedidoCodigo" TEXT,

    CONSTRAINT "itensPedidoErp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivosPedidoErp" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motivosPedidoErp_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedidosErp_codigo_key" ON "pedidosErp"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "itensPedidoErp_itemPedidoCodigo_key" ON "itensPedidoErp"("itemPedidoCodigo");

-- AddForeignKey
ALTER TABLE "produtoEans" ADD CONSTRAINT "produtoEans_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedidoErp" ADD CONSTRAINT "itensPedidoErp_motivoRecusaCodigo_fkey" FOREIGN KEY ("motivoRecusaCodigo") REFERENCES "motivosPedidoErp"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedidoErp" ADD CONSTRAINT "itensPedidoErp_motivoCancelamentoCodigo_fkey" FOREIGN KEY ("motivoCancelamentoCodigo") REFERENCES "motivosPedidoErp"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedidoErp" ADD CONSTRAINT "itensPedidoErp_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedidoErp" ADD CONSTRAINT "itensPedidoErp_pedidoErpCodigo_fkey" FOREIGN KEY ("pedidoErpCodigo") REFERENCES "pedidosErp"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itensPedidoErp" ADD CONSTRAINT "itensPedidoErp_itemPedidoCodigo_fkey" FOREIGN KEY ("itemPedidoCodigo") REFERENCES "itensPedido"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
