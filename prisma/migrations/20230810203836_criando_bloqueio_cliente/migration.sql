-- CreateTable
CREATE TABLE "bloqueiosCliente" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteCodigo" INTEGER NOT NULL,

    CONSTRAINT "bloqueiosCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BloqueiosClienteToMarca" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BloqueiosClienteToGrupo" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BloqueiosClienteToPeriodoEstoque" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "bloqueiosCliente_clienteCodigo_key" ON "bloqueiosCliente"("clienteCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "_BloqueiosClienteToMarca_AB_unique" ON "_BloqueiosClienteToMarca"("A", "B");

-- CreateIndex
CREATE INDEX "_BloqueiosClienteToMarca_B_index" ON "_BloqueiosClienteToMarca"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BloqueiosClienteToGrupo_AB_unique" ON "_BloqueiosClienteToGrupo"("A", "B");

-- CreateIndex
CREATE INDEX "_BloqueiosClienteToGrupo_B_index" ON "_BloqueiosClienteToGrupo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BloqueiosClienteToPeriodoEstoque_AB_unique" ON "_BloqueiosClienteToPeriodoEstoque"("A", "B");

-- CreateIndex
CREATE INDEX "_BloqueiosClienteToPeriodoEstoque_B_index" ON "_BloqueiosClienteToPeriodoEstoque"("B");

-- AddForeignKey
ALTER TABLE "bloqueiosCliente" ADD CONSTRAINT "bloqueiosCliente_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToMarca" ADD CONSTRAINT "_BloqueiosClienteToMarca_A_fkey" FOREIGN KEY ("A") REFERENCES "bloqueiosCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToMarca" ADD CONSTRAINT "_BloqueiosClienteToMarca_B_fkey" FOREIGN KEY ("B") REFERENCES "marcas"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToGrupo" ADD CONSTRAINT "_BloqueiosClienteToGrupo_A_fkey" FOREIGN KEY ("A") REFERENCES "bloqueiosCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToGrupo" ADD CONSTRAINT "_BloqueiosClienteToGrupo_B_fkey" FOREIGN KEY ("B") REFERENCES "grupos"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToPeriodoEstoque" ADD CONSTRAINT "_BloqueiosClienteToPeriodoEstoque_A_fkey" FOREIGN KEY ("A") REFERENCES "bloqueiosCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BloqueiosClienteToPeriodoEstoque" ADD CONSTRAINT "_BloqueiosClienteToPeriodoEstoque_B_fkey" FOREIGN KEY ("B") REFERENCES "periodosEstoque"("periodo") ON DELETE CASCADE ON UPDATE CASCADE;
