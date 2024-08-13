-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "clienteCodigo" INTEGER,
ADD COLUMN     "eClient" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clienteCodigo_fkey" FOREIGN KEY ("clienteCodigo") REFERENCES "clientes"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;
