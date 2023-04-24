-- AlterTable
ALTER TABLE "catalogosProduto" ADD COLUMN     "isGroupProduct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStockLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderBy" TEXT;
