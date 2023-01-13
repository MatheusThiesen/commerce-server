-- CreateTable
CREATE TABLE "produtosNaoImportado" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtosNaoImportado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtosNaoImportado_id_key" ON "produtosNaoImportado"("id");
