import { FilterListProps, ItemFilter } from '@/@types/FilterList';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { FetchProducts, ROLE_PRODUCT_ACTIVE } from './FetchProducts';

interface ListProductsFiltersProps {
  filters?: ItemFilter[];
}

/*
**Talvez
  - CorPrimaria
  - CorSecundaria
*/

@Injectable()
export class ListProductsFilters {
  constructor(
    private prisma: PrismaService,
    private fetchProducts: FetchProducts,
  ) {}

  async execute({ filters }: ListProductsFiltersProps) {
    const filterList: FilterListProps[] = [];

    const whereNormalized = await this.fetchProducts.whereNormalized(filters);

    const salePrices = await this.prisma.$queryRawUnsafe<{ max: number }[]>(
      `
    select MAX(p."precoVenda") as "max"from produtos p
    inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
    inner join marcas m on p."marcaCodigo" = m.codigo 
    inner join grupos g on p."grupoCodigo" = g.codigo 
    inner join generos gen on p."generoCodigo" = gen.codigo 
    where 
      ${ROLE_PRODUCT_ACTIVE}
      ${whereNormalized}
  `,
    );

    const brands = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
      select distinct m.codigo, m.descricao from produtos p
      inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
      inner join marcas m on p."marcaCodigo" = m.codigo 
      inner join grupos g on p."grupoCodigo" = g.codigo 
      inner join generos gen on p."generoCodigo" = gen.codigo 
      where 
        ${ROLE_PRODUCT_ACTIVE}
        ${whereNormalized}
    `,
    );

    const lines = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
      select distinct l.codigo, l.descricao from produtos p
      inner join linhas l on p."linhaCodigo" = l.codigo
      inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
      inner join marcas m on p."marcaCodigo" = m.codigo 
      inner join grupos g on p."grupoCodigo" = g.codigo 
      inner join generos gen on p."generoCodigo" = gen.codigo 
      where 
        ${ROLE_PRODUCT_ACTIVE}
        ${whereNormalized}
  `,
    );

    const collections = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
      select distinct c.codigo, c.descricao from produtos p
      inner join colecoes c on p."colecaoCodigo" = c.codigo
      inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
      inner join marcas m on p."marcaCodigo" = m.codigo 
      inner join grupos g on p."grupoCodigo" = g.codigo 
      inner join generos gen on p."generoCodigo" = gen.codigo 
      where 
        ${ROLE_PRODUCT_ACTIVE}
        ${whereNormalized}
`,
    );

    const groups = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
    select distinct g.codigo, g.descricao from produtos p
    inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
    inner join marcas m on p."marcaCodigo" = m.codigo 
    inner join grupos g on p."grupoCodigo" = g.codigo 
    inner join generos gen on p."generoCodigo" = gen.codigo 
    where 
      ${ROLE_PRODUCT_ACTIVE}
      ${whereNormalized}
`,
    );

    const subgroups = await this.prisma.$queryRawUnsafe<
      { id: string; descricao: string }[]
    >(
      `
      select distinct s.id, s.descricao from produtos p
      inner join subgrupos s on p."subGrupoId" = s.id
      inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
      inner join marcas m on p."marcaCodigo" = m.codigo 
      inner join grupos g on p."grupoCodigo" = g.codigo 
      inner join generos gen on p."generoCodigo" = gen.codigo 
      where 
        ${ROLE_PRODUCT_ACTIVE}
        ${whereNormalized}
`,
    );

    const genders = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
      select distinct ge.codigo, ge.descricao from produtos p
      inner join generos ge on p."generoCodigo" = ge.codigo
      inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
      inner join marcas m on p."marcaCodigo" = m.codigo 
      inner join grupos g on p."grupoCodigo" = g.codigo 
      inner join generos gen on p."generoCodigo" = gen.codigo 
      where 
        ${ROLE_PRODUCT_ACTIVE}
        ${whereNormalized}
`,
    );

    const stockLocations = await this.prisma.$queryRawUnsafe<
      { periodo: string; descricao: string }[]
    >(
      `
    select distinct le.periodo, le.descricao, le."data"  from produtos p
    inner join "locaisEstoque" le on le."produtoCodigo" = p.codigo
    inner join marcas m on p."marcaCodigo" = m.codigo 
    inner join grupos g on p."grupoCodigo" = g.codigo 
    inner join generos gen on p."generoCodigo" = gen.codigo 
    where 
      ${ROLE_PRODUCT_ACTIVE}
      ${whereNormalized}
    order by le."data" 
`,
    );

    const concepts = await this.prisma.$queryRawUnsafe<
      { codigo: number; descricao: string }[]
    >(
      `
      select c.codigo, c.descricao from conceitos c 
      inner join "regrasProdutoConceito" r on c.codigo = r."conceitoCodigo"
      where c."eAtivo" = true 
      ${
        subgroups.length > 0
          ? `and r."subGrupoId" in (${subgroups.map(
              (subgroup) => `'${subgroup.id}'`,
            )})`
          : ''
      }
      
`,
    );

    const banners = await this.prisma.banner.findMany({
      select: {
        id: true,
        titulo: true,
      },
      where: {
        eAtivo: true,

        marcas: {
          some: {
            codigo: {
              in: brands.map((item) => item.codigo),
            },
          },
        },
      },
    });

    filterList.push(
      {
        label: 'Locais Estoque',
        name: 'locaisEstoque',
        data: stockLocations
          .map((stockLocation) => ({
            name: stockLocation.descricao,
            value: stockLocation.periodo,
          }))
          .sort((a) => (a.value === 'pronta-entrega' ? -1 : 1)),
      },
      {
        label: 'Marca',
        name: 'marcaCodigo',
        data: brands.map((brand) => ({
          name: brand.descricao,
          value: brand.codigo,
        })),
      },
      {
        label: 'Grupo',
        name: 'grupoCodigo',
        data: groups.map((group) => ({
          name: group.descricao,
          value: group.codigo,
        })),
      },
      {
        label: 'Subgrupo',
        name: 'subGrupoId',
        data: subgroups.map((subgroup) => ({
          name: subgroup.descricao,
          value: subgroup.id,
        })),
      },

      {
        label: 'Gênero',
        name: 'generoCodigo',
        data: genders.map((gender) => ({
          name: gender.descricao,
          value: gender.codigo,
        })),
      },
      {
        label: 'Linha',
        name: 'linhaCodigo',
        data: lines.map((line) => ({
          name: line.descricao,
          value: line.codigo,
        })),
      },
      {
        label: 'Coleção',
        name: 'colecaoCodigo',
        data: collections.map((collection) => ({
          name: collection.descricao,
          value: collection.codigo,
        })),
      },
      {
        label: 'Conceito',
        name: 'concept',
        data: concepts.map((concept) => ({
          name: concept.descricao,
          value: concept.codigo,
        })),
      },
      {
        label: 'Banners',
        name: 'banners',
        data: banners.map((banner) => ({
          name: banner.titulo,
          value: banner.id,
        })),
      },
      {
        label: 'Possui foto',
        name: 'possuiFoto',
        data: [
          {
            name: 'SIM',
            value: 1,
          },
          {
            name: 'NÃO',
            value: 0,
          },
        ],
      },
      {
        label: 'Preço de venda',
        name: 'salePrices',
        data: [
          {
            name: 'min',
            value: 0,
          },
          {
            name: 'max',
            value: Number(salePrices?.[0].max),
          },
        ],
      },
    );

    return filterList
      .filter((item) =>
        item.name === 'marcaCodigo'
          ? item.data.length <= 1
            ? undefined
            : item
          : item,
      )
      .filter((item) => item.data.length >= 1)
      .filter((boolean) => boolean);
  }
}
