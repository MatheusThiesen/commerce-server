import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
};

type SellerSetBlocks = {
  sellerCode: number;

  blocks: {
    groups: string[] | [];
    stocksLocation: string[] | [];
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

  async findAll({ page, pagesize, orderby, search }: listAllProps) {
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
          periodosEstoque: {
            set: blocks.stocksLocation.map((item) => ({ periodo: item })),
          },

          grupos: {
            set: blocks.groups.map((item) => ({ codigo: +item })),
          },
        },
        where: {
          id: findBlock.id,
        },
      });
    } else {
      await this.prisma.bloqueiosVendedor.create({
        data: {
          periodosEstoque: {
            connect: blocks.stocksLocation.map((item) => ({ periodo: item })),
          },

          grupos: {
            connect: blocks.groups.map((item) => ({ codigo: +item })),
          },
          vendedorCodigo: sellerCode,
        },
      });
    }

    return;
  }
}
