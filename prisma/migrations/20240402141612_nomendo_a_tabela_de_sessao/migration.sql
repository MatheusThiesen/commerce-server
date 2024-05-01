/*
  Warnings:

  - You are about to drop the `Sessao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sessao" DROP CONSTRAINT "Sessao_usuarioId_fkey";

-- DropTable
DROP TABLE "Sessao";

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "sessaoToken" TEXT NOT NULL,
    "expirar" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_pin_key" ON "sessoes"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_sessaoToken_key" ON "sessoes"("sessaoToken");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
