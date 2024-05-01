import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

type listAllProps = {
  page: number;
  pagesize: number;
  search: string;
  orderby?: string;
};

@Injectable()
export class PanelRulesService {
  readonly fieldsSearchConcept: FieldsProps[] = [
    {
      name: 'concept',
      type: 'string',
      custom(search: string) {
        return {
          conceito: {
            descricao: {
              mode: 'insensitive',
              contains: search,
            },
          },
        };
      },
    },
    {
      name: 'subgroup',
      type: 'string',
      custom(search: string) {
        return {
          subGrupo: {
            descricao: {
              mode: 'insensitive',
              contains: search,
            },
          },
        };
      },
    },
    {
      name: 'group',
      type: 'string',
      custom(search: string) {
        return {
          subGrupo: {
            grupo: {
              descricao: {
                mode: 'insensitive',
                contains: search,
              },
            },
          },
        };
      },
    },
  ];

  readonly fieldsSearchPaymentCondition: FieldsProps[] = [
    {
      name: 'listaPrecoCodigo',
      type: 'number',
    },
    {
      name: 'brand',
      type: 'string',
      custom(search: string) {
        return {
          marca: {
            descricao: {
              mode: 'insensitive',
              contains: search,
            },
          },
        };
      },
    },
    {
      name: 'paymentCondition',
      type: 'string',
      custom(search: string) {
        return {
          condicaoPagamento: {
            descricao: {
              mode: 'insensitive',
              contains: search,
            },
          },
        };
      },
    },
    {
      name: 'localPayment',
      type: 'string',
      custom(search: string) {
        return {
          localCobranca: {
            descricao: {
              mode: 'insensitive',
              contains: search,
            },
          },
        };
      },
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
  ) {}

  async conceptListAll({ page, pagesize, search }: listAllProps) {
    const rules = await this.prisma.regraProdutoConceito.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        id: true,
        subGrupo: {
          select: {
            codigo: true,
            descricao: true,
            grupo: {
              select: {
                codigo: true,
                descricao: true,
              },
            },
          },
        },
        conceito: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },

      orderBy: {
        conceito: {
          descricao: 'asc',
        },
      },
      where: {
        AND: [
          { OR: this.searchFilter.execute(search, this.fieldsSearchConcept) },
        ],
      },
    });

    const total = await this.prisma.regraProdutoConceito.count({});

    return {
      data: rules,
      page,
      pagesize,
      total: total,
    };
  }

  async paymentConditionListAll({ page, pagesize, search }: listAllProps) {
    const rules = await this.prisma.regraCondicaoPagamento.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        id: true,
        eApenasDiferenciado: true,
        eAtivo: true,
        valorMinimo: true,
        condicaoPagamento: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        localCobranca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        listaPrecoCodigo: true,
        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      orderBy: [
        {
          marca: {
            codigo: 'asc',
          },
        },
        { listaPrecoCodigo: 'asc' },
        { valorMinimo: 'asc' },
        {
          localCobranca: {
            descricao: 'asc',
          },
        },
      ],

      where: {
        AND: [
          {
            OR: this.searchFilter.execute(
              search,
              this.fieldsSearchPaymentCondition,
            ),
          },
        ],
      },
    });

    const total = await this.prisma.regraCondicaoPagamento.count({});

    return {
      data: rules,
      page,
      pagesize,
      total: total,
    };
  }
}
