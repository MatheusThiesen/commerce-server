import { PrismaService } from '@/database/prisma.service';
import { ClientsService } from '@/modules/app/clients/clients.service';
import { OrderBy } from '@/utils/OrderBy.utils';
import { SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
};

type ClientSetBlocks = {
  clientCode: number;

  blocks: {
    brands: string[] | [];
    groups: string[] | [];
    stocksLocation: string[] | [];
  };
};

@Injectable()
export class PanelClientsService {
  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
  ) {}

  async findOne(codigo: number) {
    const client = await this.prisma.cliente.findUnique({
      select: {
        codigo: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        cidade: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        uf: true,
        incricaoEstadual: true,
        complemento: true,
        celular: true,
        telefone: true,
        telefone2: true,
        obs: true,
        email: true,
        email2: true,
        titulo: {
          select: {
            id: true,
          },
          where: {
            dataPagamento: null,
            dataVencimento: {
              lte: this.clientsService.getDateDaysAgo(),
            },
          },
        },
        conceito: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        ramoAtividade: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        vendedores: {
          select: {
            codigo: true,
          },
        },
      },
      where: { codigo },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    return client;
  }

  async findAll({ page, pagesize, orderby, search }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const clients = await this.prisma.cliente.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        eAtivo: true,
        razaoSocial: true,
        nomeFantasia: true,
        cidade: true,
        cnpj: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        uf: true,
        telefone: true,
        email: true,

        titulo: {
          select: {
            id: true,
          },
          where: {
            dataPagamento: null,
            dataVencimento: {
              lte: this.clientsService.getDateDaysAgo(),
            },
          },
        },
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],
      where: {
        AND: [
          {
            OR: this.searchFilter.execute(
              search,
              this.clientsService.fieldsSearch,
            ),
          },
        ],
      },
    });

    const clientsTotal = await this.prisma.cliente.count({});

    return {
      data: clients,
      page,
      pagesize,
      total: clientsTotal,
    };
  }

  async blocks(codigo: number) {
    const client = await this.prisma.cliente.findFirst({
      select: {
        codigo: true,
      },
      where: { codigo },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    const blocks = await this.prisma.bloqueiosCliente.findFirst({
      select: {
        id: true,
        periodosEstoque: {
          select: {
            periodo: true,
            descricao: true,
          },
        },
        marcas: {
          select: {
            codigo: true,
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
      where: { clienteCodigo: client.codigo },
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
    const brands = await this.prisma.marca.findMany({
      select: {
        codigo: true,
        descricao: true,
      },
      orderBy: {
        descricao: 'asc',
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
        marcas: brands,
      },
    };
  }

  async blockSet({ clientCode, blocks }: ClientSetBlocks) {
    const client = await this.prisma.cliente.findFirst({
      select: {
        codigo: true,
      },
      where: { codigo: clientCode },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    const findBlock = await this.prisma.bloqueiosCliente.findFirst({
      select: {
        id: true,
      },
      where: { clienteCodigo: clientCode },
    });

    if (findBlock) {
      await this.prisma.bloqueiosCliente.update({
        data: {
          periodosEstoque: {
            set: blocks.stocksLocation.map((item) => ({ periodo: item })),
          },
          marcas: {
            set: blocks.brands.map((item) => ({ codigo: +item })),
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
      await this.prisma.bloqueiosCliente.create({
        data: {
          periodosEstoque: {
            connect: blocks.stocksLocation.map((item) => ({ periodo: item })),
          },
          marcas: {
            connect: blocks.brands.map((item) => ({ codigo: +item })),
          },
          grupos: {
            connect: blocks.groups.map((item) => ({ codigo: +item })),
          },
          clienteCodigo: clientCode,
        },
      });
    }

    return;
  }
}
