-- AlterTable
ALTER TABLE "marcas" ADD COLUMN     "valorPedidoMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "condicoesPagamento" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condicoesPagamento_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "RegrasCondicaoPagamento" (
    "id" TEXT NOT NULL,
    "valorMinimo" DOUBLE PRECISION NOT NULL DEFAULT 9999999,
    "listaPrecoCodigo" INTEGER NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "marcaCodigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegrasCondicaoPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "condicoesPagamento_codigo_key" ON "condicoesPagamento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "RegrasCondicaoPagamento_id_key" ON "RegrasCondicaoPagamento"("id");

-- AddForeignKey
ALTER TABLE "RegrasCondicaoPagamento" ADD CONSTRAINT "RegrasCondicaoPagamento_marcaCodigo_fkey" FOREIGN KEY ("marcaCodigo") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
