-- CreateTable
CREATE TABLE "RegrasProdutoConceito" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subGrupoId" TEXT NOT NULL,
    "conceitoCodigo" INTEGER NOT NULL,

    CONSTRAINT "RegrasProdutoConceito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegrasProdutoConceito_id_key" ON "RegrasProdutoConceito"("id");

-- AddForeignKey
ALTER TABLE "RegrasProdutoConceito" ADD CONSTRAINT "RegrasProdutoConceito_subGrupoId_fkey" FOREIGN KEY ("subGrupoId") REFERENCES "subgrupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegrasProdutoConceito" ADD CONSTRAINT "RegrasProdutoConceito_conceitoCodigo_fkey" FOREIGN KEY ("conceitoCodigo") REFERENCES "conceitos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
