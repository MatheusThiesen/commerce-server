/*
  Warnings:

  - You are about to drop the column `email` on the `vendedores` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `vendedores` table. All the data in the column will be lost.
  - You are about to drop the column `senhaRefresh` on the `vendedores` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `vendedores` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vendedores_email_key";

-- AlterTable
ALTER TABLE "vendedores" DROP COLUMN "email",
DROP COLUMN "senha",
DROP COLUMN "senhaRefresh",
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tokenRefresh" TEXT,
    "eAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_id_key" ON "usuarios"("id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
