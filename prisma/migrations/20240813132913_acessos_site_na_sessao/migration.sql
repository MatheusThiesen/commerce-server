/*
  Warnings:

  - You are about to drop the column `acessoSite` on the `registrosSessao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "registrosSessao" DROP COLUMN "acessoSite";

-- AlterTable
ALTER TABLE "sessoes" ADD COLUMN     "acessoSite" "AcessoSiteSessao" NOT NULL DEFAULT 'app';
