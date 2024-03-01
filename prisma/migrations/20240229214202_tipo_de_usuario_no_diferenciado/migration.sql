-- AlterTable
ALTER TABLE "diferenciados" ADD COLUMN     "dataFinalizado" TIMESTAMP(3),
ADD COLUMN     "eAprovado" BOOLEAN,
ADD COLUMN     "tipoUsuario" "TipoUsuario" NOT NULL DEFAULT 'VENDEDOR';
