-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_uf_fkey" FOREIGN KEY ("uf") REFERENCES "estados"("uf") ON DELETE RESTRICT ON UPDATE CASCADE;
