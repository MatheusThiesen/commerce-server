import { GroupByObj } from '@/utils/GroupByObj.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ItemFilter } from '../dto/query-products.type';

interface GetProductParams {
  codigo: number;
  codigoAlternativo: string;
  referencia: string;
  descricao: string;
  precoVenda: number;
  precoTabela28: number;
  precoTabela42: number;
  precoTabela56: number;
  precoTabela300: number;
}

interface FetchProductsRequest {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;

  distinct?: 'codigoAlternativo' | 'referencia';
  search?: string;
}
interface FetchProductsResponse {
  products: any[];
}

export const ROLE_PRODUCT_ACTIVE = `
  p."eAtivo" and
  m."eVenda" and
  g."eVenda" and
  le."eAtivo" and le.quantidade > 0 
`;

@Injectable()
export class FetchProducts {
  constructor(
    private prisma: PrismaService,
    private readonly groupByObj: GroupByObj,
  ) {}

  async execute({
    page,
    pagesize,
    orderBy,
    filters,
    userId,
    distinct,
    search,
  }: FetchProductsRequest): Promise<FetchProductsResponse> {
    const brandsForSeller = await this.verifyUserAndBrandsForSeller(userId);

    const orderByNormalized = this.orderByNormalized(orderBy);
    const whereNormalized = await this.whereNormalized(filters);
    const searchNormalized = this.searchNormalized(search);
    const distinctNormalized = this.distinctNormalized(distinct);

    const query = `
      with listProduct as (
        select
          ${distinctNormalized} 
          p.referencia,
          p."codigoAlternativo",
          p.codigo,
          p.descricao,
          p."imagemPreview",
          p."precoVenda",
          p."precoTabela28",
          p."precoTabela42",
          p."precoTabela56",
          p."precoTabela300",
          m.ornador as "marcaOrdernador", g.ornador as "grupoOrdernador", gen.ornador as "generoOrdernador"
        from produtos p 
        inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
        inner join marcas m on p."marcaCodigo" = m.codigo 
        inner join grupos g on p."grupoCodigo" = g.codigo 
        inner join generos gen on p."generoCodigo" = gen.codigo 
        where 
          ${ROLE_PRODUCT_ACTIVE}
          ${brandsForSeller}
          -- Filtros adicionais
          ${whereNormalized}
          ${searchNormalized}
      )
      select
        l."codigoAlternativo",
        l.codigo,
        l.referencia,
        l.descricao,
        l."precoVenda",
        l."imagemPreview",
        l."precoTabela28",
        l."precoTabela42",
        l."precoTabela56",
        l."precoTabela300"       
      from listProduct l
      order by l."marcaOrdernador" asc, l."grupoOrdernador" asc, l."generoOrdernador" asc, ${orderByNormalized}, l.codigo desc
      limit ${pagesize}
      offset ${page * pagesize}
    `;

    const products = await this.prisma.$queryRawUnsafe<GetProductParams[]>(
      query,
    );

    return {
      products: products,
    };
  }

  orderByNormalized(orderby: string) {
    if (!orderby) return '';

    const [field, orderbyType] = orderby.split('.');

    return `l."${field}" ${orderbyType}`;
  }

  searchNormalized(search: string) {
    if (!search) return '';

    const query: string[] = [];

    query.push(`unaccent(p.descricao) ilike unaccent('%${search}%')`);
    query.push(`unaccent(p.referencia) ilike unaccent('%${search}%')`);
    query.push(`unaccent(p."codigoAlternativo") ilike unaccent('%${search}%')`);

    if (!isNaN(Number(search))) {
      query.push(`p.codigo = ${Number(search)}`);
    }

    return 'and (' + query.join(' or ') + ')';
  }

  distinctNormalized(distinct: 'codigoAlternativo' | 'referencia' | undefined) {
    if (!distinct) {
      return `DISTINCT ON (p.codigo)`;
    }

    if (distinct === 'referencia') {
      return `DISTINCT ON (p.referencia)`;
    }

    if (distinct === 'codigoAlternativo') {
      return `DISTINCT ON (p."codigoAlternativo")`;
    }
  }

  async whereNormalized(filters: ItemFilter[]) {
    const query: string[] = [];
    const groupFilters = this.groupByObj.execute(filters, (item) => item.name);

    for (const filter of groupFilters) {
      switch (filter.value) {
        case 'referencia':
          query.push(
            `${filter.value} in (${filter.data
              .map((f) => `'${f.value}'`)
              .join(',')})`,
          );
          break;
        case 'subGrupoId':
          query.push(
            `"${filter.value}" in (${filter.data
              .map((f) => `'${f.value}'`)
              .join(',')})`,
          );
          break;
        case 'locaisEstoque':
          query.push(
            `le.periodo in (${filter.data
              .map((f) => `'${f.value}'`)
              .join(',')})`,
          );
          break;
        case 'priceListCod':
          break;
        case 'concept':
          const subgroupsId = await this.prisma.subGrupo.findMany({
            select: {
              id: true,
            },
            where: {
              regraProdutoConceito: {
                some: {
                  conceitoCodigo: {
                    in: filter.data.map((item) => Number(item.value)),
                  },
                },
              },
            },
          });

          query.push(
            `"subGrupoId" in (${subgroupsId
              .map((f) => `'${f.id}'`)
              .join(',')})`,
          );
          break;
        case 'possuiFoto':
          query.push(
            `p."possuiFoto" = ${Boolean(Number(filter.data[0].value))}`,
          );
          break;
        case 'salePrices':
          query.push(
            `"precoVenda" >= ${filter.data[0].value} and "precoVenda" <= ${filter.data[1].value}`,
          );
          break;
        case 'clientCod':
          const findOneClient = await this.prisma.cliente.findUniqueOrThrow({
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
              codigo: filter.data[0]?.value ? Number(filter.data[0].value) : 0,
            },
          });

          const clientConceptSubgroupsId = await this.prisma.subGrupo.findMany({
            select: {
              id: true,
            },
            where: {
              regraProdutoConceito: {
                some: {
                  conceitoCodigo: findOneClient.conceito.codigo,
                },
              },
            },
          });

          if (clientConceptSubgroupsId.length > 0) {
            query.push(
              `"subGrupoId" in (${clientConceptSubgroupsId
                .map((f) => `'${f.id}'`)
                .join(',')})`,
            );
          } else {
            query.push(`"subGrupoId" in ('not')`);
          }

          if (findOneClient?.bloqueios?.marcas.length > 0) {
            query.push(`
              p."marcaCodigo" not in (${findOneClient?.bloqueios.marcas.map(
                (brand) => brand.codigo,
              )})
            `);
          }

          if (findOneClient?.bloqueios?.grupos.length > 0) {
            query.push(`
              p."grupoCodigo" not in (${findOneClient?.bloqueios.grupos.map(
                (group) => group.codigo,
              )})
            `);
          }

          if (findOneClient?.bloqueios?.periodosEstoque.length > 0) {
            query.push(`
              le.periodo not in (${findOneClient?.bloqueios.periodosEstoque.map(
                (period) => `'${period.periodo}'`,
              )})
            `);
          }

          if (findOneClient?.estado?.bloqueiosMarca.length > 0) {
            query.push(`
              p."marcaCodigo" not in (${findOneClient?.estado?.bloqueiosMarca.map(
                (brand) => brand.marcaCodigo,
              )})
            `);
          }

          break;
        case 'banners':
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
              id: filter.data[0]?.value ? String(filter.data[0].value) : '0',
            },
          });

          if (findOneBanner.marcas.length > 0) {
            query.push(`
            p."marcaCodigo" in (${findOneBanner?.marcas.map(
              (item) => item.codigo,
            )})
          `);
          }
          if (findOneBanner.colecoes.length > 0) {
            query.push(`
            p."colecaoCodigo" in (${findOneBanner?.colecoes.map(
              (item) => item.codigo,
            )})
          `);
          }
          if (findOneBanner.linhas.length > 0) {
            query.push(`
            p."linhaCodigo" in (${findOneBanner?.linhas.map(
              (item) => item.codigo,
            )})
          `);
          }
          if (findOneBanner.grupos.length > 0) {
            query.push(`
            p."grupoCodigo" in (${findOneBanner?.grupos.map(
              (item) => item.codigo,
            )})
          `);
          }
          if (findOneBanner.generos.length > 0) {
            query.push(`
            p."generoCodigo" in (${findOneBanner?.generos.map(
              (item) => item.codigo,
            )})
          `);
          }
          if (findOneBanner.locaisEstoque.length > 0) {
            query.push(`
            le.periodo in (${findOneBanner.locaisEstoque.map(
              (period) => `'${period.periodo}'`,
            )})
          `);
          }
          break;

        default:
          query.push(
            ` "${filter.value}" in (${filter.data
              .map((f) => f.value)
              .join(',')})`,
          );
          break;
      }
    }

    if (query.length < 1) {
      return '';
    }

    return 'and ' + query.join(' and ');
  }

  async verifyUserAndBrandsForSeller(userId) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedor: {
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
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) return '';

    const query: string[] = [];

    if (user.vendedor?.bloqueios?.grupos.length > 0) {
      query.push(`
        p."grupoCodigo" not in (${user.vendedor?.bloqueios.grupos.map(
          (group) => group.codigo,
        )})
      `);
    }

    if (user.vendedor?.bloqueios?.periodosEstoque.length > 0) {
      query.push(`
        le.periodo not in (${user.vendedor?.bloqueios.periodosEstoque.map(
          (period) => `'${period.periodo}'`,
        )})
      `);
    }

    query.push(
      `p."marcaCodigo" in (${user.vendedor.marcas
        .map((item) => item.codigo)
        .join(',')})`,
    );

    return `and ${query.join(' and ')}`;
  }
}
