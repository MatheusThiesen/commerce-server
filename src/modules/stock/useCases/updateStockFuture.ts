import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class UpdateStockFuture {
  constructor(private prisma: PrismaService) {}

  async execute(cod: number) {
    try {
      const responseQuery: any = await this.prisma.$queryRaw`
        select o.periodo,o.nome , COALESCE(SUM(o.quantidade),0) as "total"  from "ordensCompra" o
        where o."produtoCodigo" in (${cod}) and o."eAtivo" = true
        group by o.periodo,o.nome ;`;

      for (const item of responseQuery) {
        const [month, year] = item?.periodo?.split('-');

        try {
          const responseQueryTwo = await this.prisma.$queryRawUnsafe(`
            select COALESCE(SUM(i.quantidade),0) as "total" from "itensPedido" i
            inner join pedidos p on p.codigo = i."pedidoCodigo"
            where
            i."produtoCodigo" in (${cod})
            and p."dataFaturamento" >= '${year}-${month}-01'
            and p."dataFaturamento" < 
            '${year}-${String(Number(month) + 1).padStart(2, '0')}-01'
            and i.situacao in (1,2,3)
            group by i."produtoCodigo";`);

          if (
            responseQueryTwo &&
            responseQueryTwo[0] &&
            responseQueryTwo[0]?.total
          ) {
            const totalOrders = Number(responseQueryTwo[0]?.total);
            const totalPurchaseOrder = Number(item?.total);

            const existStock = await this.prisma.localEstoque.findUnique({
              where: {
                periodo_produtoCodigo: {
                  periodo: item?.periodo,
                  produtoCodigo: cod,
                },
              },
            });

            const qtd = totalPurchaseOrder - totalOrders;

            if (existStock) {
              await this.prisma.localEstoque.update({
                data: {
                  quantidade: qtd,
                },
                where: {
                  id: existStock.id,
                },
              });
            } else {
              const [month, year] = item?.periodo.split('-');

              await this.prisma.localEstoque.create({
                data: {
                  produtoCodigo: cod,
                  quantidade: qtd,
                  descricao: item.nome,
                  periodo: item?.periodo,
                  data: new Date(`${year}-${month}-01T23:59`),
                },
              });
            }
          }
        } catch (error) {}
      }
    } catch (error) {}
  }
}
