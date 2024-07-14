import { PrismaService } from '@/database/prisma.service';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';

type listAllProps = {
  page: number;
  pagesize: number;
  search: string;
  orderby?: string;
};

@Injectable()
export class PanelBrandsService {
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'descricao',
      type: 'string',
    },
    {
      name: 'valorPedidoMinimo',
      type: 'number',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
  ) {}

  async findOne(codigo: number) {
    const brands = await this.prisma.marca.findFirst({
      select: {
        codigo: true,
        descricao: true,
        eAtivo: true,
        eVenda: true,
        valorPedidoMinimo: true,
      },
      where: { codigo },
    });

    if (!brands) {
      throw new Error('marca does not exist');
    }

    return brands;
  }

  async findAll({ page, pagesize, search, orderby }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const brands = await this.prisma.marca.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        descricao: true,
        eAtivo: true,
        eVenda: true,
        valorPedidoMinimo: true,
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],
      where: {
        AND: [{ OR: this.searchFilter.execute(search, this.fieldsSearch) }],
      },
    });

    const brandsTotal = await this.prisma.marca.count({});

    return {
      data: brands,
      page,
      pagesize,
      total: brandsTotal,
    };
  }

  async blocks(marcaCodigo: number) {
    const blocks = await this.prisma.bloqueiosMarca.findMany({
      select: {
        id: true,
        marcaCodigo: true,
        estado: {
          select: {
            nome: true,
            uf: true,
          },
        },
      },
      where: { marcaCodigo: marcaCodigo },
      orderBy: {
        uf: 'asc',
      },
    });

    if (!blocks) {
      throw new Error('marca does not exist');
    }

    return { data: blocks };
  }

  async blockCreate(marcaCodigo: number, state: string) {
    const alreadyExistState = await this.prisma.estado.findUnique({
      where: {
        uf: state,
      },
    });

    if (!alreadyExistState) {
      throw new Error('uf does not exist');
    }

    const created = await this.prisma.bloqueiosMarca.create({
      select: {
        id: true,
        marcaCodigo: true,
        estado: {
          select: {
            nome: true,
            uf: true,
          },
        },
      },
      data: {
        marcaCodigo: marcaCodigo,
        uf: alreadyExistState.uf,
      },
    });

    return created;
  }

  async blockRemove(blockId: string) {
    const alreadyExistBlock = await this.prisma.bloqueiosMarca.findUnique({
      where: {
        id: blockId,
      },
    });

    if (!alreadyExistBlock) {
      throw new Error('Block does not exist');
    }

    await this.prisma.bloqueiosMarca.delete({
      where: {
        id: alreadyExistBlock.id,
      },
    });

    return;
  }
}
