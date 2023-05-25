-- CreateTable
CREATE TABLE "produtoImagens" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sequencia" INTEGER NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "produtoCodigo" INTEGER NOT NULL,

    CONSTRAINT "produtoImagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtoImagens_produtoCodigo_nome_sequencia_key" ON "produtoImagens"("produtoCodigo", "nome", "sequencia");

-- AddForeignKey
ALTER TABLE "produtoImagens" ADD CONSTRAINT "produtoImagens_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
