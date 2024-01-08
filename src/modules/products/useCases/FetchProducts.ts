import { Injectable } from '@nestjs/common';
import { GroupByObj } from 'src/utils/GroupByObj.utils';
import { PrismaService } from '../../../database/prisma.service';
import { ItemFilter } from '../dto/query-products.type';

interface FetchProductsRequest {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;
}
interface FetchProductsResponse {
  products: any[];
}

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
  }: FetchProductsRequest): Promise<FetchProductsResponse> {
    const brandsForSeller = await this.verifyUserAndBrandsForSeller(userId);

    const orderByNormalized = this.orderByNormalized(orderBy);
    const whereNormalized = await this.whereNormalized(filters);

    const products = await this.prisma.$queryRawUnsafe<any[]>(`
    with listProduct as (
      select 
        p."codigoAlternativo",
        p.codigo,
        p.referencia,
        p.descricao,
        p."descricaoAdicional",
        p."precoVenda",
        p."marcaCodigo",
        p."linhaCodigo",
        p."colecaoCodigo",
        p."grupoCodigo",
        p."subGrupoId",
        p."generoCodigo",
        
        m.ornador as "marcaOrdernador", g.ornador as "grupoOrdernador", gen.ornador as "generoOrdernador"
        from produtos p 
        inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
        inner join marcas m on p."marcaCodigo" = m.codigo 
        inner join grupos g on p."grupoCodigo" = g.codigo 
        inner join generos gen on p."generoCodigo" = gen.codigo 
        where 
        -- Regra de produto ativo
        p."eAtivo" and
        m."eVenda" and
        g."eVenda" and
        le."eAtivo" and le.quantidade > 0 
        ${brandsForSeller}
        -- Filtros adicionais
        ${whereNormalized}
    )

    select * from listProduct l
    order by l."marcaOrdernador" asc, l."grupoOrdernador" asc, l."generoOrdernador" asc, ${orderByNormalized}, l.codigo desc
    limit ${pagesize}
    offset ${page * pagesize}
  `);

    return {
      products,
    };
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

          query.push(
            `"subGrupoId" in (${clientConceptSubgroupsId
              .map((f) => `'${f.id}'`)
              .join(',')})`,
          );

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
                (period) => period.periodo,
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

  orderByNormalized(orderby: string) {
    if (!orderby) return '';

    const [field, orderbyType] = orderby.split('.');

    return `l."${field}" ${orderbyType}`;
  }

  async verifyUserAndBrandsForSeller(userId) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedor: {
          select: {
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

    return `and p."marcaCodigo" in (${user.vendedor.marcas
      .map((item) => item.codigo)
      .join(',')})`;
  }
}
