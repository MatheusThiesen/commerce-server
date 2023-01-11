/*
  Warnings:

  - The primary key for the `itensPedido` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sitiacao` on the `itensPedido` table. All the data in the column will be lost.
  - Added the required column `situacao` to the `itensPedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itensPedido" DROP CONSTRAINT "itensPedido_pkey",
DROP COLUMN "sitiacao",
ADD COLUMN     "situacao" INTEGER NOT NULL,
ALTER COLUMN "codigo" SET DATA TYPE TEXT,
ADD CONSTRAINT "itensPedido_pkey" PRIMARY KEY ("codigo");
