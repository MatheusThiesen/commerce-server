-- AlterTable
ALTER TABLE "estados" ALTER COLUMN "nome" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bloqueiosMarca" (
    "id" TEXT NOT NULL,
    "eVenda" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "marcaCodigo" INTEGER NOT NULL,
    "uf" TEXT NOT NULL,

    CONSTRAINT "bloqueiosMarca_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bloqueiosMarca" ADD CONSTRAINT "bloqueiosMarca_marcaCodigo_fkey" FOREIGN KEY ("marcaCodigo") REFERENCES "marcas"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueiosMarca" ADD CONSTRAINT "bloqueiosMarca_uf_fkey" FOREIGN KEY ("uf") REFERENCES "estados"("uf") ON DELETE RESTRICT ON UPDATE CASCADE;
