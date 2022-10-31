-- CreateTable
CREATE TABLE "locaisEstoque" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "produtoCodigo" INTEGER NOT NULL,

    CONSTRAINT "locaisEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locaisEstoque_id_key" ON "locaisEstoque"("id");

-- AddForeignKey
ALTER TABLE "locaisEstoque" ADD CONSTRAINT "locaisEstoque_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
