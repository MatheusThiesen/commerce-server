-- CreateTable
CREATE TABLE "ramosAtividade" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "abreviacao" TEXT,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ramosAtividade_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "clientes" (
    "codigo" INTEGER NOT NULL,
    "cnpj" TEXT NOT NULL,
    "credito" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "incricaoEstadual" TEXT,
    "celular" TEXT,
    "telefone" TEXT,
    "telefone2" TEXT,
    "eAtivo" BOOLEAN NOT NULL DEFAULT false,
    "uf" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "cep" TEXT NOT NULL,
    "obs" TEXT,
    "obsRestrita" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conceitoCodigo" INTEGER,
    "ramoAtividadeCodigo" INTEGER,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "_ClienteToVendedor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ramosAtividade_codigo_key" ON "ramosAtividade"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigo_key" ON "clientes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "_ClienteToVendedor_AB_unique" ON "_ClienteToVendedor"("A", "B");

-- CreateIndex
CREATE INDEX "_ClienteToVendedor_B_index" ON "_ClienteToVendedor"("B");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_conceitoCodigo_fkey" FOREIGN KEY ("conceitoCodigo") REFERENCES "conceitos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_ramoAtividadeCodigo_fkey" FOREIGN KEY ("ramoAtividadeCodigo") REFERENCES "ramosAtividade"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClienteToVendedor" ADD CONSTRAINT "_ClienteToVendedor_A_fkey" FOREIGN KEY ("A") REFERENCES "clientes"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClienteToVendedor" ADD CONSTRAINT "_ClienteToVendedor_B_fkey" FOREIGN KEY ("B") REFERENCES "vendedores"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
