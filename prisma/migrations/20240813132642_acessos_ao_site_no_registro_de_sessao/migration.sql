-- CreateEnum
CREATE TYPE "AcessoSiteSessao" AS ENUM ('painel', 'app');

-- AlterTable
ALTER TABLE "registrosSessao" ADD COLUMN     "acessoSite" "AcessoSiteSessao" NOT NULL DEFAULT 'app';
