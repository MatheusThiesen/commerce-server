import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GroupByObj } from 'src/utils/GroupByObj.utils';
import { ItemFilter } from '../dto/query-products.type';
import { ListingRule } from './ListingRule';

@Injectable()
export class FilterOrderNormalized {
  constructor(
    private prisma: PrismaService,
    private readonly groupByObj: GroupByObj,
    private readonly listingRule: ListingRule,
  ) {}

  async execute(filters?: ItemFilter[]) {
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

        if (filterGroup.value === 'referencia') {
          newFilter = {
            [filterGroup.value as string]: {
              in: filterGroup.data.map((item) => item.value),
            },
          };
        }

        if (filterGroup.value === 'locaisEstoque') {
          newFilter = {
            locaisEstoque: {
              some: {
                ...this.listingRule.execute().locaisEstoque.some,
                periodo: {
                  in: filterGroup.data.map((item) => item.value),
                },
              },
            },
          };
        }

        if (filterGroup.value === 'priceListCod') {
          newFilter = {
            listaPreco: {
              some: {
                codigo: { in: filterGroup.data.map((item) => item.value) },
              },
            },
          };
        }

        if (filterGroup.value === 'concept') {
          newFilter = {
            subGrupo: {
              regraProdutoConceito: {
                some: {
                  conceitoCodigo: {
                    in: filterGroup.data.map((item) => item.value),
                  },
                },
              },
            },
          };
        }

        if (filterGroup.value === 'possuiFoto') {
          newFilter = {
            possuiFoto: Boolean(Number(filterGroup.data[0].value)),
          };
        }

        if (filterGroup.value === 'salePrices') {
          newFilter = {
            precoVenda: {
              gte: filterGroup.data[0].value,
              lte: filterGroup.data[1].value,
            },
          };
        }

        if (filterGroup.value === 'clientCod') {
          const findOneClient = await this.prisma.cliente.findUnique({
            select: {
              bloqueios: {
                select: {
                  marcas: {
                    select: {
                      codigo: true,
                    },
                  },
                  grupos: {
                    select: {
                      codigo: true,
                    },
                  },
                  periodosEstoque: {
                    select: {
                      periodo: true,
                    },
                  },
                },
              },
              estado: {
                select: {
                  bloqueiosMarca: {
                    select: {
                      marcaCodigo: true,
                    },
                    where: {
                      eAtivo: true,
                    },
                  },
                },
              },
              conceito: {
                select: {
                  codigo: true,
                },
              },
            },
            where: {
              codigo: filterGroup.data[0]?.value
                ? Number(filterGroup.data[0].value)
                : 0,
            },
          });

          newFilter = {
            subGrupo: {
              regraProdutoConceito: {
                some: {
                  conceitoCodigo: findOneClient
                    ? findOneClient.conceito.codigo
                    : 0,
                },
              },
            },
          };

          if (findOneClient?.bloqueios?.marcas.length > 0) {
            newFilter = {
              ...newFilter,
              marca: {
                codigo: {
                  notIn: findOneClient?.bloqueios.marcas.map(
                    (brand) => brand.codigo,
                  ),
                },
              },
            };
          }
          if (findOneClient?.bloqueios?.grupos.length > 0) {
            newFilter = {
              ...newFilter,
              grupoCodigo: {
                notIn: findOneClient?.bloqueios.grupos.map(
                  (group) => group.codigo,
                ),
              },
            };
          }
          if (findOneClient?.bloqueios?.periodosEstoque.length > 0) {
            newFilter = {
              ...newFilter,
              locaisEstoque: {
                some: {
                  periodo: {
                    notIn: findOneClient?.bloqueios.periodosEstoque.map(
                      (period) => period.periodo,
                    ),
                  },
                },
              },
            };
          }

          if (findOneClient?.estado?.bloqueiosMarca.length > 0) {
            newFilter = {
              ...newFilter,
              marca: {
                codigo: {
                  notIn: findOneClient?.estado?.bloqueiosMarca.map(
                    (brand) => brand.marcaCodigo,
                  ),
                },
              },
            };
          }
        }

        if (filterGroup.value === 'banners') {
          const findOneBanner = await this.prisma.banner.findUnique({
            select: {
              marcas: { select: { codigo: true } },
              colecoes: { select: { codigo: true } },
              linhas: { select: { codigo: true } },
              grupos: { select: { codigo: true } },
              generos: { select: { codigo: true } },
              locaisEstoque: { select: { periodo: true } },
            },
            where: {
              id: filterGroup.data[0]?.value
                ? String(filterGroup.data[0].value)
                : '0',
            },
          });

          newFilter = {};

          if (findOneBanner.marcas.length > 0) {
            newFilter = {
              ...newFilter,
              marcaCodigo: {
                in: findOneBanner?.marcas.map((item) => item.codigo),
              },
            };
          }
          if (findOneBanner.colecoes.length > 0) {
            newFilter = {
              ...newFilter,
              colecaoCodigo: {
                in: findOneBanner?.colecoes.map((item) => item.codigo),
              },
            };
          }
          if (findOneBanner.linhas.length > 0) {
            newFilter = {
              ...newFilter,
              linhaCodigo: {
                in: findOneBanner?.linhas.map((item) => item.codigo),
              },
            };
          }
          if (findOneBanner.grupos.length > 0) {
            newFilter = {
              ...newFilter,
              grupoCodigo: {
                in: findOneBanner?.grupos.map((item) => item.codigo),
              },
            };
          }
          if (findOneBanner.generos.length > 0) {
            newFilter = {
              ...newFilter,
              generoCodigo: {
                in: findOneBanner?.generos.map((item) => item.codigo),
              },
            };
          }
          if (findOneBanner.locaisEstoque.length > 0) {
            newFilter = {
              ...newFilter,
              locaisEstoque: {
                some: {
                  periodo: {
                    in: findOneBanner.locaisEstoque.map((item) => item.periodo),
                  },
                },
              },
            };
          }
        }

        if (filterGroup.value === 'vendedorCodigo') {
          const findOneSeller = await this.prisma.vendedor.findUnique({
            select: {
              bloqueios: {
                select: {
                  grupos: {
                    select: {
                      codigo: true,
                    },
                  },
                  periodosEstoque: {
                    select: {
                      periodo: true,
                    },
                  },
                },
              },
              marcas: {
                select: {
                  codigo: true,
                },
              },
            },
            where: {
              codigo: filterGroup.data[0]?.value
                ? Number(filterGroup.data[0].value)
                : 0,
            },
          });

          newFilter = {};

          if (findOneSeller?.bloqueios?.grupos.length > 0) {
            newFilter = {
              ...newFilter,
              grupoCodigo: {
                notIn: findOneSeller?.bloqueios.grupos.map(
                  (group) => group.codigo,
                ),
              },
            };
          }
          if (findOneSeller?.bloqueios?.periodosEstoque.length > 0) {
            newFilter = {
              ...newFilter,
              locaisEstoque: {
                some: {
                  periodo: {
                    notIn: findOneSeller?.bloqueios.periodosEstoque.map(
                      (period) => period.periodo,
                    ),
                  },
                },
              },
            };
          }
        }

        filterNormalized = { ...filterNormalized, ...newFilter };
      }
    }

    return filterNormalized;
  }
}
