/*
  Warnings:

  - You are about to drop the column `tabelaPreco` on the `condicaoPagamentoParcelas` table. All the data in the column will be lost.
  - You are about to drop the column `situacao` on the `itensPedido` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `itensPedido` table. All the data in the column will be lost.
  - You are about to drop the column `valorUnitaro` on the `itensPedido` table. All the data in the column will be lost.
  - You are about to drop the `CarteiraClienteRepresentante` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[condicaoPagamentoCodigo,sequencia,tabelaPrecoCodigo]` on the table `condicaoPagamentoParcelas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pedidoCodigo,produtoCodigo]` on the table `itensPedido` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tabelaPrecoCodigo` to the `condicaoPagamentoParcelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorUnitario` to the `itensPedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteCodigo` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condicaoPagamentoCodigo` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localEstoqueId` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tabelaPrecoCodigo` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorTotal` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CarteiraClienteRepresentante" DROP CONSTRAINT "CarteiraClienteRepresentante_clienteCodigo_fkey";

-- DropForeignKey
ALTER TABLE "CarteiraClienteRepresentante" DROP CONSTRAINT "CarteiraClienteRepresentante_vendedorCodigo_fkey";

-- DropIndex
DROP INDEX "itensPedido_pedidoCodigo_produtoCodigo_sequencia_key";

-- AlterTable
ALTER TABLE "condicaoPagamentoParcelas" DROP COLUMN "tabelaPreco",
ADD COLUMN     "tabelaPrecoCodigo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "itensPedido" DROP COLUMN "situacao",
DROP COLUMN "valorTotal",
DROP COLUMN "valorUnitaro",
ADD COLUMN     "valorUnitario" DOUBLE PRECISION NOT NULL;

-- AlterTable
CREATE SEQUENCE pedidos_codigo_seq;
ALTER TABLE "pedidos" ADD COLUMN     "clienteCodigo" INTEGER NOT NULL,
ADD COLUMN     "condicaoPagamentoCodigo" INTEGER NOT NULL,
ADD COLUMN     "eRascunho" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "localEstoqueId" TEXT NOT NULL,
ADD COLUMN     "tabelaPrecoCodigo" INTEGER NOT NULL,
ADD COLUMN     "valorTotal" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "codigo" SET DEFAULT nextval('pedidos_codigo_seq');
ALTER SEQUENCE pedidos_codigo_seq OWNED BY "pedidos"."codigo";

-- DropTable
DROP TABLE "CarteiraClienteRepresentante";

-- CreateTable
CREATE TABLE "periodosEstoque" (
    "periodo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodosEstoque_pkey" PRIMARY KEY ("periodo")
);

-- CreateTable
CREATE TABLE "vendedoresPedido" (
    "id" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "vendedorCodigo" INTEGER NOT NULL,
    "pedidoCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendedoresPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros" (
    "id" TEXT NOT NULL,
    "requsicao" TEXT NOT NULL,
    "resposta" TEXT,
    "situacaoCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pedidoCodigo" INTEGER,

    CONSTRAINT "registros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cateirasClieteRepresentante" (
    "id" TEXT NOT NULL,
    "tipo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendedorCodigo" INTEGER NOT NULL,
    "clienteCodigo" INTEGER NOT NULL,

    CONSTRAINT "cateirasClieteRepresentante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabelasPreco" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabelasPreco_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "periodosEstoque_periodo_key" ON "periodosEstoque"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "vendedoresPedido_id_key" ON "vendedoresPedido"("id");

-- CreateIndex
CREATE UNIQUE INDEX "registros_id_key" ON "registros"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cateirasClieteRepresentante_id_key" ON "cateirasClieteRepresentante"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cateirasClieteRepresentante_vendedorCodigo_clienteCodigo_key" ON "cateirasClieteRepresentante"("vendedorCodigo", "clienteCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "tabelasPreco_codigo_key" ON "tabelasPreco"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "condicaoPagamentoParcelas_condicaoPagamentoCodigo_sequencia_key" ON "condicaoPagamentoParcelas"("condicaoPagamentoCodigo", "sequencia", "tabelaPrecoCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "itensPedido_pedidoCodigo_produtoCodigo_key" ON "itensPedido"("pedidoCodigo", "produtoCodigo");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_localEstoqueId_fkey" FOREIGN KEY ("localEstoqueId") REFERENCES "locaisEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_condicaoPagamentoCodigo_fkey" FOREIGN KEY ("condicaoPagamentoCodigo") REFERENCES "condicoesPagamento"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_tabelaPrecoCodigo_fkey" FOREIGN KEY ("tabelaPrecoCodigo") REFERENCES "tabelasPreco"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedoresPedido" ADD CONSTRAINT "vendedoresPedido_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedoresPedido" ADD CONSTRAINT "vendedoresPedido_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros" ADD CONSTRAINT "registros_pedidoCodigo_fkey" FOREIGN KEY ("pedidoCodigo") REFERENCES "pedidos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cateirasClieteRepresentante" ADD CONSTRAINT "cateirasClieteRepresentante_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cateirasClieteRepresentante" ADD CONSTRAINT "cateirasClieteRepresentante_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicaoPagamentoParcelas" ADD CONSTRAINT "condicaoPagamentoParcelas_tabelaPrecoCodigo_fkey" FOREIGN KEY ("tabelaPrecoCodigo") REFERENCES "tabelasPreco"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
