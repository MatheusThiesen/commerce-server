-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "gradeCodigo" INTEGER;

-- CreateTable
CREATE TABLE "grades" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "abreviacao" TEXT,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Tamanhos" (
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradeCodigo" INTEGER,

    CONSTRAINT "Tamanhos_pkey" PRIMARY KEY ("descricao")
);

-- CreateIndex
CREATE UNIQUE INDEX "grades_codigo_key" ON "grades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Tamanhos_descricao_key" ON "Tamanhos"("descricao");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_gradeCodigo_fkey" FOREIGN KEY ("gradeCodigo") REFERENCES "grades"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tamanhos" ADD CONSTRAINT "Tamanhos_gradeCodigo_fkey" FOREIGN KEY ("gradeCodigo") REFERENCES "grades"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
