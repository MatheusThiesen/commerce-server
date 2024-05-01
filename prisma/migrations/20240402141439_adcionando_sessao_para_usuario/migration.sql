-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "sessaoToken" TEXT NOT NULL,
    "expirar" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_pin_key" ON "Sessao"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_sessaoToken_key" ON "Sessao"("sessaoToken");

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
