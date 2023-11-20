-- CreateIndex
CREATE INDEX "produtos_marcaCodigo_grupoCodigo_subGrupoId_eAtivo_linhaCod_idx" ON "produtos"("marcaCodigo", "grupoCodigo", "subGrupoId", "eAtivo", "linhaCodigo", "colecaoCodigo", "generoCodigo", "possuiFoto");
