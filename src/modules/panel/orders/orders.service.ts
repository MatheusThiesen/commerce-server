import { PrismaService } from '@/database/prisma.service';
import { SendOrderErpApiProducerService } from '@/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { BadRequestException, Injectable } from '@nestjs/common';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
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
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
        ],
      },
    });

    const ordersTotal = await this.prisma.pedido.count({});

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
}
