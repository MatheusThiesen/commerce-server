-- CreateTable
CREATE TABLE "conceitos" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "abreviacao" TEXT,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceitos_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "conceitos_codigo_key" ON "conceitos"("codigo");
