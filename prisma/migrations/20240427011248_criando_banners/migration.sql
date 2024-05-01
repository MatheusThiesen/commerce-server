-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "qtdClicks" INTEGER NOT NULL DEFAULT 0,
    "ordernar" TEXT,
    "filtro" TEXT,
    "isGroupProduct" BOOLEAN NOT NULL DEFAULT false,
    "imagemDesktopId" INTEGER NOT NULL,
    "imagemMobileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tamanho" DOUBLE PRECISION NOT NULL,
    "url" TEXT NOT NULL,
    "tipoArquivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_imagemDesktopId_fkey" FOREIGN KEY ("imagemDesktopId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_imagemMobileId_fkey" FOREIGN KEY ("imagemMobileId") REFERENCES "arquivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
