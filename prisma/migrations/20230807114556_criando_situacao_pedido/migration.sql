-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "situacaoPedidoCodigo" INTEGER;

-- AlterTable
ALTER TABLE "regrasCondicaoPagamento" ADD COLUMN     "localCobrancaCodigo" INTEGER;

-- CreateTable
CREATE TABLE "situacoesPedido" (
    "codigo" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "situacoesPedido_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "locaisCobranca" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locaisCobranca_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "situacoesPedido_codigo_key" ON "situacoesPedido"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "locaisCobranca_codigo_key" ON "locaisCobranca"("codigo");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_situacaoPedidoCodigo_fkey" FOREIGN KEY ("situacaoPedidoCodigo") REFERENCES "situacoesPedido"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regrasCondicaoPagamento" ADD CONSTRAINT "regrasCondicaoPagamento_localCobrancaCodigo_fkey" FOREIGN KEY ("localCobrancaCodigo") REFERENCES "locaisCobranca"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
