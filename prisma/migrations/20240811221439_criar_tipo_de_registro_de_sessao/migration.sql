-- CreateEnum
CREATE TYPE "TipoRegistroSessao" AS ENUM ('singup', 'signin', 'refresh', 'resetPassword');

-- AlterTable
ALTER TABLE "registrosSessao" ADD COLUMN     "tipo" "TipoRegistroSessao";
