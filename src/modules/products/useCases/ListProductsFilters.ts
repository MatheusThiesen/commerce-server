import { Injectable } from '@nestjs/common';
import { ProdutoWhereInput } from 'prisma';
import { PrismaService } from '../../../database/prisma.service';

interface ListProductsFiltersProps {
  where?: ProdutoWhereInput;
}

type FilterListProps = {
  label: string;
  name: string;
  data: ItemFilter[];
};
type ItemFilter = {
  name: string;
  value: number | string;
};

/*
Filtros
-[X] Marca
-[X] Colecao
-[X] Linha
-[X] Grupo
-[X] Subgrupo
-[X] Referencia
-[X] Cód. Produto

**Talvez
  - CorPrimaria
  - CorSecundaria
*/

@Injectable()
export class ListProductsFilters {
  constructor(private prisma: PrismaService) {}

  async execute({ where }: ListProductsFiltersProps) {
    const filterList: FilterListProps[] = [];
    const brands = await this.prisma.produto.findMany({
      distinct: 'marcaCodigo',
      where: where,
      select: {
        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const lines = await this.prisma.produto.findMany({
      distinct: 'linhaCodigo',
      where: where,
      select: {
        linha: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const collections = await this.prisma.produto.findMany({
      distinct: 'colecaoCodigo',
      where: where,
      select: {
        colecao: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const groups = await this.prisma.produto.findMany({
      distinct: 'grupoCodigo',
      where: where,
      select: {
        grupo: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const subgroups = await this.prisma.produto.findMany({
      distinct: 'subGrupoId',
      where: where,
      select: {
        subGrupo: {
          select: {
            id: true,
            descricao: true,
          },
        },
      },
    });
    const genders = await this.prisma.produto.findMany({
      distinct: 'generoCodigo',
      where: where,
      select: {
        genero: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const references = await this.prisma.produto.findMany({
      distinct: 'referencia',
      where: where,
      select: {
        referencia: true,
      },
    });
    const stockLocations = await this.prisma.localEstoque.findMany({
      distinct: 'periodo',
      where: { Produto: where, quantidade: { gt: 0 } },
      select: {
        periodo: true,
        descricao: true,
      },
      orderBy: {
        periodo: 'asc',
      },
    });

    const concepts = await this.prisma.conceito.findMany({
      select: {
        codigo: true,
        descricao: true,
        regraProdutoConceito: {
          select: {
            subGrupo: {
              select: {
                codigo: true,
                descricao: true,
              },
            },
          },
        },
      },
      where: {
        eAtivo: true,
        regraProdutoConceito: {
          some: {
            subGrupo: {
              id: {
                in: subgroups.map((subgroup) => subgroup.subGrupo.id),
              },
            },
          },
        },
      },
    });

    filterList.push(
      {
        label: 'Referência',
        name: 'referencia',
        data: references.map((reference) => ({
          name: reference.referencia,
          value: reference.referencia,
        })),
      },
      {
        label: 'Marca',
        name: 'marcaCodigo',
        data: brands.map((brand) => ({
          name: brand.marca.descricao,
          value: brand.marca.codigo,
        })),
      },
      {
        label: 'Linha',
        name: 'linhaCodigo',
        data: lines
          .filter((f) => f.linha)
          .map((line) => ({
            name: line.linha.descricao,
            value: line.linha.codigo,
          })),
      },
      {
        label: 'Coleção',
        name: 'colecaoCodigo',
        data: collections
          .filter((f) => f.colecao)
          .map((collection) => ({
            name: collection.colecao.descricao,
            value: collection.colecao.codigo,
          })),
      },
      {
        label: 'Grupo',
        name: 'grupoCodigo',
        data: groups.map((group) => ({
          name: group.grupo.descricao,
          value: group.grupo.codigo,
        })),
      },
      {
        label: 'Subgrupo',
        name: 'subGrupoId',
        data: subgroups
          .filter((f) => f.subGrupo)
          .map((subgroup) => ({
            name: subgroup.subGrupo.descricao,
            value: subgroup.subGrupo.id,
          })),
      },
      {
        label: 'Gênero',
        name: 'generoCodigo',
        data: genders
          .filter((f) => f.genero)
          .map((gender) => ({
            name: gender.genero.descricao,
            value: gender.genero.codigo,
          })),
      },

      {
        label: 'Locais Estoque',
        name: 'locaisEstoque',
        data: stockLocations
          .filter((f) => f.periodo)
          .map((stockLocation) => ({
            name: stockLocation.descricao,
            value: stockLocation.periodo,
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
        label: 'Possui foto',
        name: 'possuiFoto',
        data: [
          {
            name: 'SIM',
            value: 1,
          },
          {
            name: 'NÃO',
            value: 1,
          },
        ],
      },
    );

    return filterList;
  }
}
