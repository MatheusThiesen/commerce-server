import { Injectable } from '@nestjs/common';
import { FilterListProps } from 'src/@types/FilterList';
import { PrismaService } from 'src/database/prisma.service';
import { GroupByObj } from 'src/utils/GroupByObj.utils';
import { OrderBy } from 'src/utils/OrderBy.utils';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { FieldsProps, SearchFilter } from 'src/utils/SearchFilter.utils';
import { StringToNumberOrUndefined } from 'src/utils/StringToNumberOrUndefined.utils';
import { ItemFilter } from '../products/dto/query-products.type';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

type listAllProps = {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;
  search?: string;
};

@Injectable()
export class ClientsService {
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'cnpj',
      type: 'string',
      exact: true,
    },
    {
      name: 'razaoSocial',
      type: 'string',
    },
    {
      name: 'nomeFantasia',
      type: 'string',
    },
  ];

  readonly daysAgo = 15;

  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private orderBy: OrderBy,
    private readonly groupByObj: GroupByObj,
    private readonly searchFilter: SearchFilter,
    private readonly stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  getDateDaysAgo() {
    const now = new Date();
    now.setDate(now.getDate() - this.daysAgo);
    const daysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );

    return daysAgo;
  }

  async create(createClientDto: CreateClientDto) {
    const client = new Client();
    Object.assign(client, createClientDto);

    const clientExists = await this.prisma.cliente.findUnique({
      where: {
        codigo: client.codigo,
      },
    });

    if (clientExists) {
      throw new Error('client already exists');
    }

    await this.createOrUpdateState(client.uf);

    const created = await this.prisma.cliente.create({
      data: client,
    });

    return created;
  }

  async update(codigo: number, updateClientDto: UpdateClientDto) {
    const client = new Client();
    Object.assign(client, updateClientDto);

    await this.findOne(codigo);

    await this.createOrUpdateState(client.uf);

    const updeted = await this.prisma.cliente.update({
      data: client,
      where: {
        codigo,
      },
    });

    return updeted;
  }

  async findOne(codigo: number) {
    const client = await this.prisma.cliente.findFirst({
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
              lte: this.getDateDaysAgo(),
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
      },
      where: { codigo },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    return client;
  }

  async findFirst(codigo: number, userId: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedorCodigo: true,
      },
      where: {
        id: userId,
      },
    });

    const filterNormalized: object[] = [{ codigo: codigo }];

    if (user.eVendedor) {
      filterNormalized.push({
        carteiraClienteRepresentante: {
          some: {
            vendedorCodigo: user.vendedorCodigo,
          },
        },
      });
    }

    const client = await this.prisma.cliente.findFirst({
      select: {
        codigo: true,
        razaoSocial: true,
        nomeFantasia: true,
        cidade: true,
        cnpj: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        uf: true,
        incricaoEstadual: true,
        complemento: true,
        telefone: true,
        telefone2: true,
        obs: true,
        email: true,
        email2: true,
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
      },
      where: {
        AND: [
          ...filterNormalized,
          {
            eAtivo: true,
            ramoAtividade: {
              eAtivo: true,
              eVenda: true,
            },
          },
        ],
      },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    return client;
  }

  async findAll({
    page,
    pagesize,
    orderBy,
    filters,
    userId,
    search,
  }: listAllProps) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedorCodigo: true,
      },
      where: {
        id: userId,
      },
    });

    const orderByNormalized = this.orderBy.execute(orderBy);

    let filterNormalized = [];

    if (user.eVendedor) {
      filterNormalized.push({
        carteiraClienteRepresentante: {
          some: {
            vendedorCodigo: user.vendedorCodigo,
          },
        },
      });
    }

    if (filters) {
      const groupFilters = this.groupByObj.execute(
        filters,
        (item) => item.name,
      );

      filterNormalized = [
        ...filterNormalized,
        ...groupFilters.map((filterGroup) => ({
          [filterGroup.value as string]: {
            in: filterGroup.data.map((item) => item.value),
          },
        })),
      ];
    }

    const clients = await this.prisma.cliente.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        razaoSocial: true,
        nomeFantasia: true,
        cidade: true,
        cnpj: true,
        bairro: true,
        logradouro: true,
        numero: true,
        cep: true,
        uf: true,

        titulo: {
          select: {
            id: true,
          },
          where: {
            dataPagamento: null,
            dataVencimento: {
              lte: this.getDateDaysAgo(),
            },
          },
        },
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],
      where: {
        AND: [
          ...filterNormalized,
          { OR: this.searchFilter.execute(search, this.fieldsSearch) },
          {
            eAtivo: true,
            ramoAtividade: {
              eAtivo: true,
              eVenda: true,
            },
          },
        ],
      },
    });

    const clientsTotal = await this.prisma.cliente.count({
      where: {
        AND: [
          ...filterNormalized,
          { OR: this.searchFilter.execute(search, this.fieldsSearch) },
          {
            eAtivo: true,
            ramoAtividade: {
              eAtivo: true,
              eVenda: true,
            },
          },
        ],
      },
    });

    return {
      data: clients,
      page,
      pagesize,
      total: clientsTotal,
    };
  }

  async getFiltersForFindAll(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedorCodigo: true,
      },
      where: {
        id: userId,
      },
    });
    const filterList: FilterListProps[] = [];

    const filterNormalized = [];

    filterNormalized.push({
      eAtivo: true,
    });

    if (user.eVendedor) {
      filterNormalized.push({
        carteiraClienteRepresentante: {
          some: {
            vendedorCodigo: user.vendedorCodigo,
          },
        },
      });
    }

    const branchActivists = await this.prisma.cliente.findMany({
      distinct: 'ramoAtividadeCodigo',
      where: { AND: filterNormalized },
      select: {
        ramoAtividade: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const concepts = await this.prisma.cliente.findMany({
      distinct: 'conceitoCodigo',
      where: { AND: filterNormalized },
      select: {
        conceito: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });
    const ufs = await this.prisma.cliente.findMany({
      distinct: 'uf',
      where: { AND: filterNormalized },
      select: {
        uf: true,
      },
    });
    const cities = await this.prisma.cliente.findMany({
      distinct: 'cidade',
      where: { AND: filterNormalized },
      select: {
        cidade: true,
      },
    });
    const neighborhoods = await this.prisma.cliente.findMany({
      distinct: 'bairro',
      where: { AND: filterNormalized },
      select: {
        bairro: true,
      },
    });

    filterList.push(
      {
        label: 'Conceito',
        name: 'conceitoCodigo',
        data: concepts.map((concept) => ({
          name: concept.conceito.descricao,
          value: concept.conceito.codigo,
        })),
      },
      {
        label: 'Ramo de Atividade',
        name: 'ramoAtividadeCodigo',
        data: branchActivists.map((branchActivist) => ({
          name: branchActivist.ramoAtividade.descricao,
          value: branchActivist.ramoAtividade.codigo,
        })),
      },
      {
        label: 'UF',
        name: 'uf',
        data: ufs.map((uf) => ({
          name: uf.uf,
          value: uf.uf,
        })),
      },
      {
        label: 'Cidade',
        name: 'cidade',
        data: cities.map((city) => ({
          name: city.cidade,
          value: city.cidade,
        })),
      },
      {
        label: 'Bairro',
        name: 'bairro',
        data: neighborhoods.map((neighborhood) => ({
          name: neighborhood.bairro,
          value: neighborhood.bairro,
        })),
      },
    );

    return filterList;
  }

  async import(file: Express.Multer.File) {
    const clients = await this.parseCsv.execute(file);

    for (const clientArr of clients) {
      const [
        codigo,
        obs,
        obsRestrita,
        cnpj,
        credito,
        razaoSocial,
        nomeFantasia,
        incricaoEstadual,
        celular,
        telefone,
        telefone2,
        email,
        email2,
        eAtivo,
        uf,
        cidadeIbgeCod,
        cidade,
        bairro,
        logradouro,
        numero,
        complemento,
        cep,
        ramoAtividadeCodigo,
        conceitoCodigo,
      ] = clientArr;

      const client = new Client();
      Object.assign(client, {
        codigo: Number(codigo),
        obs,
        obsRestrita,
        cnpj,
        credito: this.stringToNumberOrUndefined.execute(credito),
        razaoSocial,
        nomeFantasia,
        incricaoEstadual,
        celular,
        telefone,
        telefone2,
        email,
        email2,
        eAtivo: Number(eAtivo) === 1,
        uf,
        cidadeIbgeCod: this.stringToNumberOrUndefined.execute(cidadeIbgeCod),
        cidade,
        bairro,
        logradouro,
        numero,
        complemento,
        cep,
        ramoAtividadeCodigo:
          this.stringToNumberOrUndefined.execute(ramoAtividadeCodigo),
        conceitoCodigo: this.stringToNumberOrUndefined.execute(conceitoCodigo),
      });

      const clientExists = await this.prisma.cliente.findUnique({
        where: {
          codigo: client.codigo,
        },
      });

      if (clientExists) {
        await this.update(clientExists.codigo, client);
      } else {
        await this.create(client);
      }
    }

    return;
  }

  async createOrUpdateState(state: string) {
    const alreadyExists = await this.prisma.estado.findUnique({
      where: {
        uf: state,
      },
    });

    if (!alreadyExists) {
      await this.prisma.estado.create({
        data: {
          uf: state,
        },
      });
    }
  }
}
