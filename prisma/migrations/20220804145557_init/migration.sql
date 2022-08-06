-- CreateTable
CREATE TABLE "vendedores" (
    "codigo" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeGuerra" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "codGerente" INTEGER,
    "codSupervisor" INTEGER,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "eGerente" BOOLEAN NOT NULL DEFAULT false,
    "eSupervisor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "cores" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "cores_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "linhas" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "linhas_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "colecoes" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "colecoes_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "grupos" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "subgrupos" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "subgrupos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "marcas" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_codigo_key" ON "vendedores"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_email_key" ON "vendedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cores_codigo_key" ON "cores"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "linhas_codigo_key" ON "linhas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "colecoes_codigo_key" ON "colecoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_codigo_key" ON "grupos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "subgrupos_codigo_key" ON "subgrupos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_codigo_key" ON "marcas"("codigo");
