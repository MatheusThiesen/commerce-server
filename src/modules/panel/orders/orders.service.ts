import { PrismaService } from '@/database/prisma.service';
import { SendOrderErpApiProducerService } from '@/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
};

type GetOrderAnalyticProps = {
  situacao: string;
  valorTotal: number;
  quantidade: number;
  periodo: Date;
};

type OrderAnalyticNormalized = {
  analisePeriodo: OrderAnalyticPeriodNormalized[];
  quantidadeTotal: number;
  valorTotal: number;
  ticketMedio: number;
};

type OrderAnalyticPeriodNormalized = {
  periodo: Date;
  itens: OrderAnalyticItemNormalized[];
};

type OrderAnalyticItemNormalized = {
  valorTotal: number;
  quantidade: number;
  situacao: string;
};

@Injectable()
export class PanelOrdersService {
  constructor(
    private prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
    private readonly sendOrderErpApiProducerService: SendOrderErpApiProducerService,
    private readonly getRoleBySeller: GetRoleBySeller,
  ) {}

  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'codigoErp',
      type: 'number',
    },
    {
      name: 'clienteCodigo',
      type: 'number',
    },
  ];

  async findOne(codigo: number) {
    const order = await this.prisma.pedido.findFirst({
      select: {
        codigo: true,
        codigoErp: true,
        dataFaturamento: true,
        valorTotal: true,
        eRascunho: true,
        createdAt: true,

        eDiferenciado: true,
        tipoDesconto: true,
        descontoCalculado: true,
        descontoPercentual: true,
        descontoValor: true,
        vendedorPendenteDiferenciadoCodigo: true,

        vendedorPendenteDiferenciado: {
          select: {
            codigo: true,
            nome: true,
            nomeGuerra: true,
          },
        },
        situacaoPedido: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        cliente: {
          select: {
            codigo: true,
            cnpj: true,
            razaoSocial: true,
            cidade: true,
            bairro: true,
            logradouro: true,
            numero: true,
            cep: true,
            uf: true,
          },
        },
        vendedores: {
          select: {
            tipo: true,
            vendedor: {
              select: {
                codigo: true,
                nome: true,
                nomeGuerra: true,
              },
            },
          },
        },
        condicaoPagamento: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        periodoEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },
        diferenciados: {
          select: {
            id: true,
            passo: true,
            tipoDesconto: true,
            descontoCalculado: true,
            descontoPercentual: true,
            descontoValor: true,
            motivoDiferenciado: true,
            tipoUsuario: true,
            dataFinalizado: true,
            eAprovado: true,
            eFinalizado: true,
            createdAt: true,

            vendedor: {
              select: {
                codigo: true,
                nome: true,
                nomeGuerra: true,
              },
            },
          },
          orderBy: {
            passo: 'asc',
          },
        },
        itens: {
          select: {
            codigo: true,
            quantidade: true,
            valorUnitario: true,
            sequencia: true,

            produto: {
              select: {
                codigo: true,
                referencia: true,
                codigoAlternativo: true,
                descricao: true,
                descricaoAdicional: true,
                precoVenda: true,
                imagemPreview: true,
              },
            },
          },
        },
        registros: {
          select: {
            id: true,
            situacaoCodigo: true,
            requsicao: true,
            resposta: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      where: { codigo },
    });

    if (!order) {
      throw new Error('order does not exist');
    }

    const differentiatedNormalized = order.diferenciados.map(
      async (differentiated) => ({
        ...differentiated,
        vendedor: {
          ...differentiated.vendedor,
          tipoVendedor: await this.getRoleBySeller.execute(
            differentiated.vendedor.codigo,
          ),
        },
      }),
    );

    const normalized = {
      ...order,
      diferenciados: await Promise.all(differentiatedNormalized),
      vendedorPendenteDiferenciado: order.vendedorPendenteDiferenciado
        ? {
            ...order.vendedorPendenteDiferenciado,
            tipoVendedor: await this.getRoleBySeller.execute(
              order.vendedorPendenteDiferenciado.codigo,
            ),
          }
        : undefined,
    };

    return normalized;
  }

  async findAll({ page, pagesize, orderby, search }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const orders = await this.prisma.pedido.findMany({
      take: pagesize,
      skip: page * pagesize,

      select: {
        codigo: true,
        codigoErp: true,
        createdAt: true,
        dataFaturamento: true,
        valorTotal: true,
        descontoCalculado: true,
        situacaoPedido: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        cliente: {
          select: {
            cnpj: true,
            razaoSocial: true,
          },
        },
        vendedores: {
          select: {
            tipo: true,
            vendedor: {
              select: {
                codigo: true,
                nome: true,
                nomeGuerra: true,
              },
            },
          },
        },
        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        itens: {
          select: {
            codigo: true,
          },
        },
      },

      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],

      where: {
        eExluido: false,
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
        ],
      },
    });

    const ordersTotal = await this.prisma.pedido.count({
      where: {
        eExluido: false,
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
        ],
      },
    });

    return {
      data: orders,
      page,
      pagesize,
      total: ordersTotal,
    };
  }

  async resend(code: number) {
    const alreadyExistsOrder = await this.prisma.pedido.findUnique({
      where: {
        codigo: +code,
      },
    });

    if (!alreadyExistsOrder)
      throw new BadRequestException('not already exist order');

    if (!!alreadyExistsOrder.codigoErp)
      throw new BadRequestException('order ERP already exist');

    if (!!alreadyExistsOrder.eRascunho) {
      throw new BadRequestException(
        'O pedido está em modo rascunho e não pode ser processado.',
      );
    }

    if (alreadyExistsOrder.situacaoPedidoCodigo !== 5) {
      throw new BadRequestException('Situação não habilitada');
    }

    await this.prisma.pedido.update({
      data: {
        situacaoPedidoCodigo: 1,
      },
      where: {
        codigo: alreadyExistsOrder.codigo,
      },
    });

    await this.sendOrderErpApiProducerService.execute({
      orderCode: alreadyExistsOrder.codigo,
    });
  }

  async analytic(
    period: '7-days' | '14-days' | '1-month' | '3-month' | '1-year' = '7-days',
  ): Promise<OrderAnalyticNormalized> {
    const normalizedPeriod: OrderAnalyticPeriodNormalized[] = [];

    function normalizedAnalytic(contents: GetOrderAnalyticProps[]) {
      for (const data of contents) {
        const find = normalizedPeriod.find((f) =>
          dayjs(data.periodo).add(100, 's').isSame(f.periodo),
        );

        if (find) {
          find.itens.push({
            valorTotal: data.valorTotal,
            quantidade: Number(data.quantidade),
            situacao: data.situacao,
          });
        } else {
          normalizedPeriod.push({
            periodo: dayjs(data.periodo).add(100, 's').toDate(),

            itens: [
              {
                valorTotal: data.valorTotal,
                quantidade: Number(data.quantidade),
                situacao: data.situacao,
              },
            ],
          });
        }
      }
    }

    switch (period) {
      case '7-days':
        const orders7Days = await this.prisma.$queryRaw<
          GetOrderAnalyticProps[]
        >`
          SELECT 
              s.descricao AS "situacao", 
              SUM(p."valorTotal") AS "valorTotal", 
              COUNT(*) AS "quantidade", 
              DATE_TRUNC('day', p."createdAt") AS "periodo" 
          FROM pedidos p
          INNER JOIN "situacoesPedido" s ON s.codigo = p."situacaoPedidoCodigo" 
          WHERE p."eExluido" = false and p."createdAt" >= (CURRENT_DATE - INTERVAL '7 days')
          GROUP BY s.descricao, DATE_TRUNC('day', p."createdAt") 
          ORDER BY DATE_TRUNC('day', p."createdAt") ;
        `;

        normalizedAnalytic(orders7Days);

        break;
      case '14-days':
        const orders14Days = await this.prisma.$queryRaw<
          GetOrderAnalyticProps[]
        >`
          SELECT 
              s.descricao AS "situacao", 
              SUM(p."valorTotal") AS "valorTotal", 
              COUNT(*) AS "quantidade", 
              DATE_TRUNC('day', p."createdAt") AS "periodo" 
          FROM pedidos p
          INNER JOIN "situacoesPedido" s ON s.codigo = p."situacaoPedidoCodigo" 
          WHERE p."eExluido" = false and p."createdAt" >= (CURRENT_DATE - INTERVAL '14 days')
          GROUP BY s.descricao, DATE_TRUNC('day', p."createdAt") 
          ORDER BY DATE_TRUNC('day', p."createdAt") ;
        `;
        normalizedAnalytic(orders14Days);
        break;
      case '1-month':
        const orders1Month = await this.prisma.$queryRaw<
          GetOrderAnalyticProps[]
        >`
          SELECT 
              s.descricao AS "situacao", 
              SUM(p."valorTotal") AS "valorTotal", 
              COUNT(*) AS "quantidade", 
              DATE_TRUNC('day', p."createdAt") AS "periodo" 
          FROM pedidos p
          INNER JOIN "situacoesPedido" s ON s.codigo = p."situacaoPedidoCodigo" 
          WHERE p."eExluido" = false and DATE_TRUNC('month', p."createdAt") = DATE_TRUNC('month', CURRENT_DATE)
          GROUP BY s.descricao, DATE_TRUNC('day', p."createdAt") 
          ORDER BY DATE_TRUNC('day', p."createdAt") ;
        `;
        normalizedAnalytic(orders1Month);
        break;
      case '3-month':
        const orders3Months = await this.prisma.$queryRaw<
          GetOrderAnalyticProps[]
        >`
          SELECT 
              s.descricao AS "situacao", 
              SUM(p."valorTotal") AS "valorTotal", 
              COUNT(*) AS "quantidade", 
              DATE_TRUNC('month', p."createdAt") AS "periodo"
          FROM pedidos p
          INNER JOIN "situacoesPedido" s ON s.codigo = p."situacaoPedidoCodigo" 
          WHERE p."eExluido" = false and p."createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
          GROUP BY s.descricao, DATE_TRUNC('month', p."createdAt")
          ORDER BY DATE_TRUNC('month', p."createdAt");
        `;
        normalizedAnalytic(orders3Months);
        break;
      case '1-year':
        const orders1Year = await this.prisma.$queryRaw<
          GetOrderAnalyticProps[]
        >`
        SELECT 
            s.descricao AS "situacao", 
            SUM(p."valorTotal") AS "valorTotal", 
            COUNT(*) AS "quantidade", 
            DATE_TRUNC('month', p."createdAt") AS "periodo"
        FROM pedidos p
        INNER JOIN "situacoesPedido" s ON s.codigo = p."situacaoPedidoCodigo" 
        WHERE p."eExluido" = false and DATE_TRUNC('year', p."createdAt") = DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY s.descricao, DATE_TRUNC('month', p."createdAt")
        ORDER BY DATE_TRUNC('month', p."createdAt");
        `;

        normalizedAnalytic(orders1Year);
        break;
    }

    const analytic = await this.prisma.$queryRaw<
      { valorTotal: number; quantidade: number }[]
    >`
      SELECT  
	      SUM(p."valorTotal") AS "valorTotal", 
	      COUNT(*) AS "quantidade"
      FROM pedidos p; 
    `;

    return {
      analisePeriodo: normalizedPeriod,
      quantidadeTotal: Number(analytic[0].quantidade),
      valorTotal: Number(analytic[0].valorTotal),
      ticketMedio:
        Number(analytic[0].valorTotal) / Number(analytic[0].quantidade),
    };
  }
}
