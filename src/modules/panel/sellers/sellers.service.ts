import { PrismaService } from '@/database/prisma.service';
import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
  filters?: SellerFilters;
};

export type SellerFilters = {
  eAtivo?: string;
};

type SellerSetBlocks = {
  sellerCode: number;

  blocks: {
    groups?: string[] | [];
    stocksLocation?: string[] | [];
  };
};

@Injectable()
export class PanelSellersService {
  readonly directorCode = 867;
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'nome',
      type: 'string',
    },
    {
      name: 'nomeGuerra',
      type: 'string',
    },
    {
      name: 'email',
      type: 'string',
    },
  ];

  constructor(
    private prisma: PrismaService,
    private getRoleBySeller: GetRoleBySeller,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
  ) {}

  async findOne(codigo: number) {
    const seller = await this.prisma.vendedor.findFirst({
      select: {
        codigo: true,
        email: true,
        nome: true,
        nomeGuerra: true,
        eAtivo: true,
        eDiretor: true,
        eGerente: true,
        eSupervisor: true,
        codDiretor: true,
        codGerente: true,
        codSupervisor: true,
        clientes: {
          select: {
            codigo: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
        marcas: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      where: { codigo },
    });

    if (!seller) {
      throw new Error('seller does not exist');
    }

    const normalized = {
      ...seller,
      tipoVendedor: await this.getRoleBySeller.execute(seller.codigo),
      codDiretor: seller.codDiretor ?? this.directorCode,
    };

    return normalized;
  }

  async findAll({ page, pagesize, orderby, search, filters }: listAllProps) {
    const filterNormalized = filters
      ? { ...filters, eAtivo: filters.eAtivo === 'true' }
      : undefined;

    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const sellers = await this.prisma.vendedor.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        email: true,
        nome: true,
        nomeGuerra: true,
        eAtivo: true,
        eDiretor: true,
        eGerente: true,
        eSupervisor: true,
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],
      where: {
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
          filterNormalized,
        ],
      },
    });

    const sellersTotal = await this.prisma.vendedor.count({});

    return {
      data: sellers,
      page,
      pagesize,
      total: sellersTotal,
    };
  }

  async blocks(codigo: number) {
    const seller = await this.prisma.vendedor.findFirst({
      select: {
        codigo: true,
      },
      where: { codigo },
    });

    if (!seller) {
      throw new Error('seller does not exist');
    }

    const blocks = await this.prisma.bloqueiosVendedor.findFirst({
      select: {
        id: true,
        periodosEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },

        grupos: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      where: { vendedorCodigo: seller.codigo },
    });

    const stockPeriod = await this.prisma.periodoEstoque.findMany({
      select: {
        periodo: true,
        descricao: true,
      },
      orderBy: {
        data: 'asc',
      },
    });
    const groups = await this.prisma.grupo.findMany({
      select: {
        codigo: true,
        descricao: true,
      },
      orderBy: {
        descricao: 'asc',
      },
    });

    return {
      blocks: blocks,
      options: {
        periodosEstoque: stockPeriod.sort((a) =>
          a.periodo === 'pronta-entrega' ? -1 : 1,
        ),
        grupos: groups,
      },
    };
  }

  async blockSet({ sellerCode, blocks }: SellerSetBlocks) {
    const seller = await this.prisma.cliente.findFirst({
      select: {
        codigo: true,
      },
      where: { codigo: sellerCode },
    });

    if (!seller) {
      throw new Error('seller does not exist');
    }

    const findBlock = await this.prisma.bloqueiosVendedor.findFirst({
      select: {
        id: true,
      },
      where: { vendedorCodigo: sellerCode },
    });

    if (findBlock) {
      await this.prisma.bloqueiosVendedor.update({
        data: {
          periodosEstoque: !!blocks?.stocksLocation
            ? {
                set: blocks.stocksLocation.map((item) => ({ periodo: item })),
              }
            : undefined,

          grupos: !!blocks?.groups
            ? {
                set: blocks.groups.map((item) => ({ codigo: +item })),
              }
            : undefined,
        },
        where: {
          id: findBlock.id,
        },
      });
    } else {
      await this.prisma.bloqueiosVendedor.create({
        data: {
          periodosEstoque: !!blocks?.stocksLocation
            ? {
                connect: blocks.stocksLocation.map((item) => ({
                  periodo: item,
                })),
              }
            : undefined,

          grupos: !!blocks?.groups
            ? {
                connect: blocks.groups.map((item) => ({ codigo: +item })),
              }
            : undefined,
          vendedorCodigo: sellerCode,
        },
      });
    }

    return;
  }
}
