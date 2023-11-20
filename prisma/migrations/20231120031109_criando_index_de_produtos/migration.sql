-- CreateIndex
CREATE INDEX "produtos_grupoCodigo_idx" ON "produtos"("grupoCodigo");

-- CreateIndex
CREATE INDEX "produtos_subGrupoId_idx" ON "produtos"("subGrupoId");

-- CreateIndex
CREATE INDEX "produtos_linhaCodigo_idx" ON "produtos"("linhaCodigo");
