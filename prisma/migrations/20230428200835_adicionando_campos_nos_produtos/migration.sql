-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "obs" TEXT,
ADD COLUMN     "origemProdutoCodigo" INTEGER,
ADD COLUMN     "qtdEmbalagem" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unidadeMedidaUnidade" TEXT;

-- CreateTable
CREATE TABLE "origensProduto" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origensProduto_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "unidadesMedida" (
    "unidade" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidadesMedida_pkey" PRIMARY KEY ("unidade")
);

-- CreateIndex
CREATE UNIQUE INDEX "origensProduto_codigo_key" ON "origensProduto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "unidadesMedida_unidade_key" ON "unidadesMedida"("unidade");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_origemProdutoCodigo_fkey" FOREIGN KEY ("origemProdutoCodigo") REFERENCES "origensProduto"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_unidadeMedidaUnidade_fkey" FOREIGN KEY ("unidadeMedidaUnidade") REFERENCES "unidadesMedida"("unidade") ON DELETE SET NULL ON UPDATE CASCADE;
