-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "generoCodigo" INTEGER;

-- CreateTable
CREATE TABLE "generos" (
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "generos_codigo_key" ON "generos"("codigo");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_generoCodigo_fkey" FOREIGN KEY ("generoCodigo") REFERENCES "generos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
