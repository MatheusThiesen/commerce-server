import { FilterListProps, ItemFilter } from '@/@types/FilterList';
import { PrismaService } from '@/database/prisma.service';
import { SendOrderErpApiProducerService } from '@/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { GroupByObj } from '@/utils/GroupByObj.utils';
import { OrderBy } from '@/utils/OrderBy.utils';
import { ParseCsv } from '@/utils/ParseCsv.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { GetPendencyBySellerCod } from '../differentiated/useCases/GetPendencyBySellerCod';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { AddTagDifferentiatedRequestOrderApiErp } from './useCases/AddTagDifferentiatedRequestOrderApiErp';
import { RequestOrderApiErp } from './useCases/RequestOrderApiErp';
import { SketchOrderValid } from './useCases/SketchOrderValid';
import { TransformOrderToSendApiErp } from './useCases/TransformOrderToSendApiErp';

type listAllProps = {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;
  search?: string;
};

@Injectable()
export class OrderService {
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigoErp',
      type: 'number',
    },
    {
      name: 'clienteCodigo',
      type: 'number',
    },
  ];

  readonly statusOrderErp = {
    ['bloqueado']: 2,
    ['bloqueado parcial']: 2,
    ['liberado']: 2,
    ['recusado']: 2,
    ['cancelado']: 4,
    ['faturado']: 3,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderBy: OrderBy,
    private readonly groupByObj: GroupByObj,
    private readonly searchFilter: SearchFilter,
    private readonly sendOrderErpApiProducerService: SendOrderErpApiProducerService,
    private readonly addTagDifferentiatedRequestOrderApiErp: AddTagDifferentiatedRequestOrderApiErp,
    private readonly requestOrderApiErp: RequestOrderApiErp,
    private readonly transformOrderToSendApiErp: TransformOrderToSendApiErp,
    private readonly sketchOrderValid: SketchOrderValid,
    private parseCsv: ParseCsv,
    private getPendencyBySellerCod: GetPendencyBySellerCod,
  ) {}

  normalizedFiltersAll(filters?: ItemFilter[]) {
    let filterNormalized: any = {};

    if (filters) {
      const groupFilters = this.groupByObj.execute(
        filters,
        (item) => item.name,
      );

      for (const filterGroup of groupFilters) {
        let newFilter: any = {
          [filterGroup.value as string]: {
            in: filterGroup.data.map((item) =>
              isNaN(Number(item.value)) ? item.value : Number(item.value),
            ),
          },
        };

        if (filterGroup.value === 'eRascunho') {
          newFilter = {
            eRascunho: Boolean(Number(filterGroup.data[0].value)),
          };
        }

        filterNormalized = { ...filterNormalized, ...newFilter };
      }
    }

    return filterNormalized;
  }

  async verifyRelationship(order: Order): Promise<Order> {
    if (order.itens.length <= 0) {
      throw new BadRequestException('Pedido sem itens');
    }

    for (const item of order.itens) {
      const alreadyExistsProduct = await this.prisma.produto.findFirst({
        where: { codigo: Number(item?.produtoCodigo) },
      });

      if (!alreadyExistsProduct)
        throw new BadRequestException('Produto invalido');
    }

    const alreadyExistsClient = await this.prisma.cliente.findFirst({
      select: { codigo: true },
      where: {
        codigo: order.clienteCodigo,
        eAtivo: true,
      },
    });

    if (!alreadyExistsClient) {
      throw new BadRequestException('Cliente invalido');
    }

    const alreadyExistsBrand = await this.prisma.marca.findFirst({
      select: { codigo: true, valorPedidoMinimo: true },
      where: {
        codigo: order.marcaCodigo,
        eVenda: true,
      },
    });

    if (!alreadyExistsBrand) {
      throw new BadRequestException('Marca invalido');
    }

    if (
      Number(order.valorTotal) < Number(alreadyExistsBrand.valorPedidoMinimo)
    ) {
      throw new BadRequestException('Valor pedido mínimo invalido');
    }

    const alreadyExistsSeller = await this.prisma.vendedor.findFirst({
      select: { codigo: true },
      where: {
        codigo: Number(order.vendedorCodigo),
        eAtivo: true,
      },
    });

    if (!alreadyExistsSeller) {
      throw new BadRequestException('Vendedor invalido');
    }

    if (order.prepostoCodigo) {
      const alreadyExistsSellerTwo = await this.prisma.vendedor.findFirst({
        select: { codigo: true },
        where: {
          codigo: Number(order.prepostoCodigo),
          eAtivo: true,
        },
      });

      if (!alreadyExistsSellerTwo) {
        throw new BadRequestException('Preposto invalido');
      }
    }

    const alreadyExistsPaymentCondition =
      await this.prisma.condicaoPagamento.findFirst({
        select: { codigo: true },
        where: {
          codigo: Number(order.condicaoPagamentoCodigo),
          eAtivo: true,
        },
      });

    if (!alreadyExistsPaymentCondition) {
      throw new BadRequestException('Condição de pagamento invalido');
    }
    const alreadyExistsPriceTable = await this.prisma.tabelaPreco.findFirst({
      select: { codigo: true },
      where: {
        codigo: Number(order.tabelaPrecoCodigo),
        eAtivo: true,
      },
    });

    if (!alreadyExistsPriceTable) {
      throw new BadRequestException('Tabela preço invalido');
    }
    const alreadyExistsStockPeriod = await this.prisma.periodoEstoque.findFirst(
      {
        select: { data: true, periodo: true },
        where: {
          periodo: order.periodoEstoque,
        },
      },
    );

    if (!alreadyExistsStockPeriod) {
      throw new BadRequestException('Tabela pagamento de pagamento invalido');
    }

    const valorTotal = order.itens.reduce(
      (total, current) => current.valorUnitario * current.quantidade + total,
      0,
    );

    const ruleBilletLocation =
      await this.prisma.regraCondicaoPagamento.findFirstOrThrow({
        select: { localCobrancaCodigo: true },
        where: {
          condicaoPagamentoCodigo: alreadyExistsPaymentCondition.codigo,
          listaPrecoCodigo: alreadyExistsPriceTable.codigo,
          eAtivo: true,
          marcaCodigo: alreadyExistsBrand.codigo,
          valorMinimo: {
            lte: valorTotal,
          },
        },
      });

    if (!alreadyExistsStockPeriod) {
      throw new BadRequestException('Tabela pagamento de pagamento invalido');
    }

    return {
      ...order,
      localCobrancaCodigo: ruleBilletLocation.localCobrancaCodigo,
      valorTotal: +valorTotal.toFixed(2),
      dataFaturamento:
        alreadyExistsStockPeriod.periodo === 'pronta-entrega'
          ? new Date()
          : alreadyExistsStockPeriod.data,
    };
  }

  async sendApiErp(orderCode: number) {
    const alreadyExistsOrder = await this.prisma.pedido.findUnique({
      select: {
        eDiferenciado: true,
        eRascunho: true,
        situacaoPedidoCodigo: true,
        codigoErp: true,
        registros: { select: { id: true } },
      },
      where: { codigo: orderCode },
    });

    if (!alreadyExistsOrder)
      throw new BadRequestException('order does not exist');

    if (!!alreadyExistsOrder.codigoErp)
      throw new BadRequestException('order ERP already exist');

    if (!!alreadyExistsOrder.eRascunho) {
      throw new BadRequestException(
        'O pedido está em modo rascunho e não pode ser processado.',
      );
    }

    const orderTransformed = await this.transformOrderToSendApiErp.execute(
      orderCode,
    );

    try {
      const response = await this.requestOrderApiErp.execute(orderTransformed);

      const situacaoCodigo = response.status;
      const orderCodeErp = response.data.content[0].code;

      if (alreadyExistsOrder.eDiferenciado === true) {
        try {
          await this.addTagDifferentiatedRequestOrderApiErp.execute({
            orderCode: orderCodeErp,
          });
        } catch (error) {
          if (error instanceof AxiosError) {
            await this.prisma.pedido.update({
              data: {
                registros: {
                  create: {
                    requsicao: JSON.stringify({
                      payload: {
                        code: orderCodeErp,
                        destacadores: [
                          {
                            active: true,
                            tag: 'BLOQALT',
                          },
                        ],
                      },
                    }),
                    situacaoCodigo: error.response.status,
                    resposta: JSON.stringify(error.response.data),
                  },
                },
              },
              where: {
                codigo: orderCode,
              },
            });
          }
        }
      }

      await this.prisma.pedido.update({
        data: {
          codigoErp: Number(orderCodeErp),
          situacaoPedidoCodigo: 2,
          registros: {
            create: {
              requsicao: JSON.stringify(orderTransformed),
              situacaoCodigo: situacaoCodigo,
              resposta: JSON.stringify(response.data),
            },
          },
        },
        where: {
          codigo: orderCode,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        await this.prisma.pedido.update({
          data: {
            situacaoPedidoCodigo:
              // alreadyExistsOrder.registros.length >= 2 ? 5 : undefined,
              5,
            registros: {
              create: {
                requsicao: JSON.stringify(orderTransformed),
                situacaoCodigo: error.response.status,
                resposta: JSON.stringify(error.response.data),
              },
            },
          },
          where: {
            codigo: orderCode,
          },
        });
      }
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    const order = new Order();
    Object.assign(order, {
      ...createOrderDto,
    });

    const orderNormalized = await this.verifyRelationship(order);

    const created = await this.prisma.pedido.create({
      select: {
        codigo: true,
        codigoErp: true,
        dataFaturamento: true,
        valorTotal: true,
        eRascunho: true,
        eDiferenciado: true,
        vendedores: {
          select: {
            tipo: true,
            vendedor: {
              select: {
                codigo: true,
                nome: true,
              },
            },
          },
        },
        periodoEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        condicaoPagamento: {
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
          },
        },
        itens: {
          select: {
            codigo: true,
            quantidade: true,
            valorUnitario: true,
            sequencia: true,
          },
        },
      },
      data: {
        dataFaturamento: orderNormalized.dataFaturamento,
        valorTotal: orderNormalized.valorTotal,
        clienteCodigo: orderNormalized.clienteCodigo,
        marcaCodigo: orderNormalized.marcaCodigo,
        periodo: orderNormalized.periodoEstoque,
        condicaoPagamentoCodigo: orderNormalized.condicaoPagamentoCodigo,
        tabelaPrecoCodigo: orderNormalized.tabelaPrecoCodigo,
        localCobrancaCodigo: orderNormalized.localCobrancaCodigo,
        eRascunho: orderNormalized.eRascunho,

        eDiferenciado: orderNormalized.eDiferenciado,
        tipoDesconto: orderNormalized?.tipoDesconto,
        descontoPercentual: orderNormalized.descontoPercentual,
        descontoValor: orderNormalized.descontoValor,
        descontoCalculado: orderNormalized.descontoCalculado,
        motivoDiferenciado: orderNormalized.motivoDiferenciado,
        vendedorPendenteDiferenciadoCodigo:
          orderNormalized.eDiferenciado && !orderNormalized.eRascunho
            ? await this.getPendencyBySellerCod.execute({
                sellerCode: orderNormalized.vendedorCodigo,
                brandCode: orderNormalized.marcaCodigo,
              })
            : undefined,

        diferenciados:
          orderNormalized.eDiferenciado &&
          !!orderNormalized?.tipoDesconto &&
          !orderNormalized.eRascunho
            ? {
                create: {
                  tipoDesconto: orderNormalized.tipoDesconto,
                  descontoPercentual: orderNormalized.descontoPercentual,
                  descontoValor: orderNormalized.descontoValor,
                  motivoDiferenciado: orderNormalized.motivoDiferenciado,
                  vendedorCodigo: orderNormalized.vendedorCodigo,
                  descontoCalculado: orderNormalized.descontoCalculado,
                },
              }
            : undefined,
        situacaoPedidoCodigo: orderNormalized.eRascunho
          ? 7
          : orderNormalized.eDiferenciado
          ? 6
          : 1,
        itens: {
          createMany: {
            data: orderNormalized.itens.map((item, index) => ({
              produtoCodigo: item.produtoCodigo,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              sequencia: index + 1,
            })),
          },
        },
        vendedores: {
          createMany: {
            data: [
              { tipo: 1, vendedorCodigo: orderNormalized.vendedorCodigo },
              orderNormalized.prepostoCodigo && {
                tipo: 2,
                vendedorCodigo: orderNormalized.prepostoCodigo,
              },
            ],
          },
        },
      },
    });

    if (created.eRascunho === false && created.eDiferenciado === false) {
      await this.sendOrderErpApiProducerService.execute({
        orderCode: created.codigo,
      });
    }

    return created;
  }

  async update(codigo: number, updateOrderDto: UpdateOrderDto, userId: string) {
    const order = await this.findOne(codigo, userId);

    const orderNormalized = await this.verifyRelationship(updateOrderDto);

    if (isNaN(Number(order.codigoErp))) {
      throw new BadRequestException('Not possible edit order sended');
    }

    for (const item of order.itens) {
      await this.prisma.itemPedido.delete({
        where: {
          codigo: item.codigo,
        },
      });
    }

    const updated = await this.prisma.pedido.update({
      select: {
        codigo: true,
        codigoErp: true,
        dataFaturamento: true,
        valorTotal: true,
        eRascunho: true,
        eDiferenciado: true,
        vendedores: {
          select: {
            tipo: true,
            vendedor: {
              select: {
                codigo: true,
                nome: true,
              },
            },
          },
        },
        periodoEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        condicaoPagamento: {
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
          },
        },
        itens: {
          select: {
            codigo: true,
            quantidade: true,
            valorUnitario: true,
            sequencia: true,
          },
        },
      },
      data: {
        dataFaturamento: orderNormalized.dataFaturamento,
        valorTotal: orderNormalized.valorTotal,
        clienteCodigo: orderNormalized.clienteCodigo,
        marcaCodigo: orderNormalized.marcaCodigo,
        periodo: orderNormalized.periodoEstoque,
        condicaoPagamentoCodigo: orderNormalized.condicaoPagamentoCodigo,
        tabelaPrecoCodigo: orderNormalized.tabelaPrecoCodigo,
        localCobrancaCodigo: orderNormalized.localCobrancaCodigo,
        eRascunho: orderNormalized.eRascunho,

        eDiferenciado: orderNormalized.eDiferenciado,
        tipoDesconto: orderNormalized?.tipoDesconto,
        descontoPercentual: orderNormalized.descontoPercentual,
        descontoValor: orderNormalized.descontoValor,
        descontoCalculado: orderNormalized.descontoCalculado,
        motivoDiferenciado: orderNormalized.motivoDiferenciado,
        vendedorPendenteDiferenciadoCodigo:
          orderNormalized.eDiferenciado && !orderNormalized.eRascunho
            ? await this.getPendencyBySellerCod.execute({
                sellerCode: orderNormalized.vendedorCodigo,
                brandCode: orderNormalized.marcaCodigo,
              })
            : undefined,

        diferenciados:
          orderNormalized.eDiferenciado &&
          !!orderNormalized?.tipoDesconto &&
          !orderNormalized.eRascunho
            ? {
                create: {
                  tipoDesconto: orderNormalized.tipoDesconto,
                  descontoPercentual: orderNormalized.descontoPercentual,
                  descontoValor: orderNormalized.descontoValor,
                  motivoDiferenciado: orderNormalized.motivoDiferenciado,
                  vendedorCodigo: orderNormalized.vendedorCodigo,
                  descontoCalculado: orderNormalized.descontoCalculado,
                },
              }
            : undefined,
        situacaoPedidoCodigo: orderNormalized.eRascunho
          ? 7
          : orderNormalized.eDiferenciado
          ? 6
          : 1,

        itens: {
          createMany: {
            data: orderNormalized.itens.map((item, index) => ({
              produtoCodigo: item.produtoCodigo,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              sequencia: index + 1,
            })),
          },
        },
      },
      where: {
        codigo: order.codigo,
      },
    });

    if (updated.eRascunho === false && updated.eDiferenciado === false) {
      await this.sendOrderErpApiProducerService.execute({
        orderCode: updated.codigo,
      });
    }

    return updated;
  }

  async findAll({
    filters,
    search,
    orderBy,
    page,
    pagesize,
    userId,
  }: listAllProps) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        vendedorCodigo: true,
        eVendedor: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) {
      throw new BadRequestException('only sellers having orders');
    }

    const orderByNormalized = this.orderBy.execute(orderBy);

    const filterNormalized = await this.normalizedFiltersAll(filters);

    const orders = await this.prisma.pedido.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        codigoErp: true,
        dataFaturamento: true,
        createdAt: true,
        valorTotal: true,
        eRascunho: true,
        situacaoPedido: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        vendedores: {
          select: {
            tipo: true,
            vendedor: {
              select: {
                codigo: true,
                nome: true,
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
        cliente: {
          select: {
            codigo: true,
            cnpj: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
      orderBy: [orderByNormalized] ?? [{ createdAt: 'desc' }],
      where: {
        AND: [
          filterNormalized,
          { OR: this.searchFilter.execute(search, this.fieldsSearch) },
          {
            OR: [
              {
                vendedores: {
                  some: { vendedorCodigo: user.vendedorCodigo },
                },
              },
              {
                vendedorPendenteDiferenciadoCodigo: user.vendedorCodigo,
              },
              {
                diferenciados: {
                  some: {
                    vendedorCodigo: user.vendedorCodigo,
                  },
                },
              },
            ],
          },
        ],
      },
    });
    const ordersTotal = await this.prisma.pedido.count({
      where: {
        AND: [
          filterNormalized,
          { OR: this.searchFilter.execute(search, this.fieldsSearch) },
          {
            OR: [
              {
                vendedores: {
                  some: { vendedorCodigo: user.vendedorCodigo },
                },
              },
              {
                vendedorPendenteDiferenciadoCodigo: user.vendedorCodigo,
              },
              {
                diferenciados: {
                  some: {
                    vendedorCodigo: user.vendedorCodigo,
                  },
                },
              },
            ],
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

  async findOne(codigo: number, userId: string) {
    if (!codigo) {
      throw new BadRequestException('codigo not specified');
    }

    const user = await this.prisma.usuario.findUnique({
      select: {
        vendedorCodigo: true,
        eVendedor: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) {
      throw new BadRequestException('only sellers having orders');
    }

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

        diferenciados: {
          select: {
            tipoDesconto: true,
            descontoCalculado: true,
            descontoPercentual: true,
            descontoValor: true,
            motivoDiferenciado: true,
            tipoUsuario: true,
            eAprovado: true,
            dataFinalizado: true,
            eFinalizado: true,

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
        situacaoPedido: {
          select: {
            codigo: true,
            descricao: true,
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
        periodoEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        condicaoPagamento: {
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

                imagens: {
                  take: 1,
                  orderBy: { sequencia: 'asc' },
                  select: {
                    nome: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        codigo,

        OR: [
          {
            vendedores: {
              some: { vendedorCodigo: user.vendedorCodigo },
            },
          },
          {
            vendedorPendenteDiferenciadoCodigo: user.vendedorCodigo,
          },
          {
            diferenciados: {
              some: {
                vendedorCodigo: user.vendedorCodigo,
              },
            },
          },
        ],
      },
    });

    if (!order) {
      throw new BadRequestException('order does not exist');
    }

    return order;
  }

  async sketch(codigo: number, userId: string) {
    if (!codigo) {
      throw new BadRequestException('codigo not specified');
    }

    const user = await this.prisma.usuario.findUnique({
      select: {
        vendedorCodigo: true,
        eVendedor: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) {
      throw new BadRequestException('only sellers having orders');
    }

    const sketch = await this.sketchOrderValid.execute({
      orderCode: codigo,
      sellerCod: user.vendedorCodigo,
    });

    return sketch;
  }

  async getFiltersForFindAll(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedorCodigo: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) return [];

    const filterList: FilterListProps[] = [];

    const filterNormalized = [
      {
        OR: [
          {
            vendedores: {
              some: { vendedorCodigo: user.vendedorCodigo },
            },
          },
          {
            vendedorPendenteDiferenciadoCodigo: user.vendedorCodigo,
          },
          {
            diferenciados: {
              some: {
                vendedorCodigo: user.vendedorCodigo,
              },
            },
          },
        ],
      },
    ];

    const clients = await this.prisma.pedido.findMany({
      distinct: 'clienteCodigo',
      where: { AND: filterNormalized },
      select: {
        cliente: {
          select: {
            codigo: true,
            razaoSocial: true,
          },
        },
      },
    });

    const conditionPayment = await this.prisma.pedido.findMany({
      distinct: 'condicaoPagamentoCodigo',
      where: { AND: filterNormalized },
      select: {
        condicaoPagamento: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });

    const priceTable = await this.prisma.pedido.findMany({
      distinct: 'tabelaPrecoCodigo',
      where: { AND: filterNormalized },
      select: {
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });

    const status = await this.prisma.pedido.findMany({
      distinct: 'situacaoPedidoCodigo',
      where: {
        AND: [...filterNormalized, { situacaoPedidoCodigo: { not: null } }],
      },
      select: {
        situacaoPedido: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });

    filterList.push(
      {
        label: 'Situação',
        name: 'situacaoPedidoCodigo',
        data: status.map((s) => ({
          name: s.situacaoPedido.descricao,
          value: s.situacaoPedido.codigo,
        })),
      },
      {
        label: 'Cliente',
        name: 'clienteCodigo',
        data: clients.map((client) => ({
          name: client.cliente.razaoSocial,
          value: client.cliente.codigo,
        })),
      },
      {
        label: 'Condição pagamento',
        name: 'condicaoPagamentoCodigo',
        data: conditionPayment.map((payment) => ({
          name: payment.condicaoPagamento.descricao,
          value: payment.condicaoPagamento.codigo,
        })),
      },
      {
        label: 'Lista de preço',
        name: 'tabelaPrecoCodigo',
        data: priceTable.map((list) => ({
          name: list.tabelaPreco.descricao,
          value: list.tabelaPreco.codigo,
        })),
      },
    );

    return filterList;
  }

  async import(file: Express.Multer.File) {
    const orders = await this.parseCsv.execute(file);

    for (const orderArr of orders) {
      const [codigo, situacao] = orderArr;

      const orderExits = await this.prisma.pedido.findUnique({
        where: {
          codigoErp: Number(codigo),
        },
      });

      try {
        if (orderExits) {
          const statusCod = this.statusOrderErp[situacao];

          if (statusCod) {
            await this.prisma.pedido.update({
              data: {
                situacaoPedidoCodigo: statusCod,
              },
              where: {
                codigoErp: Number(codigo),
              },
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    return;
  }
}
