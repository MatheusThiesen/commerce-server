-- AlterTable
ALTER TABLE "ramosAtividade" ADD COLUMN     "eVenda" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "estados" (
    "uf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("uf")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_uf_key" ON "estados"("uf");
