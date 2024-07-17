import { PrismaService } from '@/database/prisma.service';
import { ListingRule } from '@/modules/app/products/useCases/ListingRule';
import { FilterOrderNormalized } from '@/modules/app/products/useCases/filterOrderNormalized';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Item } from '../entities/item.entity';
import { ItemList } from '../entities/itemList.entity';

type SketchOrderValidRequest = { orderCode: number; sellerCod: number };

type SketchOrderValidResponse = {
  pedido: {
    cliente: unknown;
    tabelaPreco: {
      codigo: number;
      descricao: string;
    };
    marca: {
      codigo: number;
      descricao: string;
    };
    condicaoPagamento: {
      codigo: number;
      descricao: string;
    };
    periodoEstoque: {
      descricao: string;
      periodo: string;
    };
    diferenciado?: {
      descontoCalculado: number;
      descontoPercentual: number;
      descontoValor: number;
      tipoDesconto: 'VALOR' | 'PERCENTUAL';
      motivoDiferenciado: string;
    };
  };

  itens: {
    atualizados: Item[];
    deletados: Item[];
    atuais: Item[];
  };
};

@Injectable()
export class SketchOrderValid {
  constructor(
    private prisma: PrismaService,
    private readonly filterOrderNormalized: FilterOrderNormalized,
    private readonly listingRule: ListingRule,
  ) {}

  readonly daysAgo = 15;

  async execute({
    orderCode,
    sellerCod,
  }: SketchOrderValidRequest): Promise<SketchOrderValidResponse> {
    const getOrder = await this.prisma.pedido.findFirst({
      select: {
        eDiferenciado: true,
        tipoDesconto: true,
        descontoCalculado: true,
        descontoPercentual: true,
        descontoValor: true,
        motivoDiferenciado: true,

        periodo: true,
        cliente: {
          select: {
            codigo: true,
            razaoSocial: true,
            nomeFantasia: true,
            cidade: true,
            cnpj: true,
            bairro: true,
            logradouro: true,
            numero: true,
            cep: true,
            uf: true,

            titulo: {
              select: {
                id: true,
              },
              where: {
                dataPagamento: null,
                dataVencimento: {
                  lte: this.getDateDaysAgo(),
                },
              },
            },
          },
        },
        tabelaPreco: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        periodoEstoque: {
          select: {
            descricao: true,
            periodo: true,
          },
        },
        condicaoPagamento: {
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
        itens: {
          select: {
            codigo: true,
            produtoCodigo: true,
            quantidade: true,
            valorUnitario: true,
            sequencia: true,
            produto: {
              select: {
                codigo: true,
                referencia: true,
                codigoAlternativo: true,
                descricao: true,
                descricaoComplementar: true,
                descricaoAdicional: true,
                possuiFoto: true,
                precoVendaEmpresa: true,
                ncm: true,
                obs: true,
                qtdEmbalagem: true,
                unidade: {
                  select: {
                    unidade: true,
                    descricao: true,
                  },
                },
                grupo: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                subGrupo: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                precoVenda: true,
                marca: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                colecao: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                genero: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                linha: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                corPrimaria: {
                  select: {
                    codigo: true,
                    descricao: true,
                  },
                },
                imagens: {
                  select: {
                    nome: true,
                  },
                },
                corSecundariaCodigo: true,
                corSecundaria: {
                  select: {
                    cor: {
                      select: {
                        codigo: true,
                        descricao: true,
                      },
                    },
                  },
                },

                listaPreco: {
                  select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    codigo: true,
                  },
                  where: {
                    codigo: {
                      in: [28, 42, 56, 300],
                    },
                  },
                  orderBy: {
                    codigo: 'asc',
                  },
                },

                locaisEstoque: {
                  orderBy: {
                    data: 'asc',
                  },
                  select: {
                    id: true,
                    periodo: true,
                    descricao: true,
                    quantidade: true,
                  },
                  where: {
                    ...this.listingRule.execute().locaisEstoque.some,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        codigo: orderCode,
        eRascunho: true,
        vendedores: {
          some: {
            vendedorCodigo: sellerCod,
          },
        },
      },
    });

    if (!getOrder) {
      throw new BadRequestException('Order not valid or not exist');
    }

    const itemList = new ItemList(getOrder.itens);

    const filterProduct = await this.filterOrderNormalized.execute([
      { name: 'clientCod', value: getOrder.cliente.codigo },
    ]);

    for (const item of itemList.getItems()) {
      const getProduct = await this.prisma.produto.findFirst({
        select: {
          qtdEmbalagem: true,
          locaisEstoque: {
            select: {
              quantidade: true,
              periodo: true,
            },
            where: {
              periodo: getOrder.periodo,
              quantidade: {
                gt: 0,
              },
              eAtivo: true,
            },
          },
        },
        where: {
          codigo: item.produtoCodigo,
          AND: [filterProduct, this.listingRule.execute()],
        },
      });

      if (!getProduct) {
        itemList.remove(item);
        continue;
      }

      if (
        !getProduct.locaisEstoque?.[0]?.quantidade ||
        Number(getProduct.locaisEstoque?.[0]?.quantidade) <= 0
      ) {
        itemList.remove(item);
        continue;
      }

      if (
        getProduct.locaisEstoque[0].quantidade < item.quantidade &&
        getProduct.locaisEstoque[0].quantidade % getProduct.qtdEmbalagem === 0
      ) {
        const updatedItem: Item = {
          ...item,
          quantidade: getProduct.locaisEstoque[0].quantidade,
        };
        itemList.updateOne(updatedItem);
        continue;
      }
    }

    return {
      pedido: {
        cliente: getOrder.cliente,
        condicaoPagamento: getOrder.condicaoPagamento,
        marca: getOrder.marca,
        periodoEstoque: getOrder.periodoEstoque,
        tabelaPreco: getOrder.tabelaPreco,
        diferenciado: getOrder.eDiferenciado
          ? {
              tipoDesconto: getOrder.tipoDesconto,
              descontoCalculado: getOrder.descontoCalculado,
              descontoPercentual: getOrder.descontoPercentual,
              descontoValor: getOrder.descontoValor,
              motivoDiferenciado: getOrder.motivoDiferenciado,
            }
          : undefined,
      },
      itens: {
        atuais: itemList.getItems(),
        deletados: itemList.getRemovedItems(),
        atualizados: itemList.getUpdatedItems(),
      },
    };
  }

  getDateDaysAgo() {
    const now = new Date();
    now.setDate(now.getDate() - this.daysAgo);
    const daysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );

    return daysAgo;
  }
}
