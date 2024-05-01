/*
  Warnings:

  - You are about to drop the column `url` on the `banners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "url",
ADD COLUMN     "urlSearch" TEXT;
