-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "descricaoAdicional" TEXT,
ALTER COLUMN "descricaoComplementar" DROP NOT NULL;
