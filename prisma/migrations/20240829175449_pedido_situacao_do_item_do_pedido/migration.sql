/*
  Warnings:

  - Added the required column `situacao` to the `itensPedidoErp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itensPedidoErp" ADD COLUMN     "situacao" TEXT NOT NULL;
