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
}
