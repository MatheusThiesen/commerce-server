-- CreateTable
CREATE TABLE "registrosSessao" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessaoId" TEXT NOT NULL,

    CONSTRAINT "registrosSessao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "registrosSessao" ADD CONSTRAINT "registrosSessao_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "sessoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
