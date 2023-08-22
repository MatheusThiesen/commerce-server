-- CreateTable
CREATE TABLE "titulos" (
    "id" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "desdobramento" INTEGER NOT NULL,
    "parcela" INTEGER NOT NULL,
    "nossoNumero" TEXT,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendedorCodigo" INTEGER,
    "clienteCodigo" INTEGER NOT NULL,

    CONSTRAINT "titulos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "titulos_numeroDocumento_desdobramento_clienteCodigo_key" ON "titulos"("numeroDocumento", "desdobramento", "clienteCodigo");

-- AddForeignKey
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "vendedores"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
