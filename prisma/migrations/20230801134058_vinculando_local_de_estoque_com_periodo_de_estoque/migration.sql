-- AddForeignKey
ALTER TABLE "locaisEstoque" ADD CONSTRAINT "locaisEstoque_periodo_fkey" FOREIGN KEY ("periodo") REFERENCES "periodosEstoque"("periodo") ON DELETE RESTRICT ON UPDATE CASCADE;
