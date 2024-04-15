import { ClientsService } from '@/modules/app/clients/clients.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

type listAllProps = {
  page: number;
  pagesize: number;
};

@Injectable()
export class PanelClientsService {
  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
  ) {}

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
      },
      where: { codigo },
    });

    if (!client) {
      throw new Error('client does not exist');
    }

    return client;
  }

  async findAll({ page, pagesize }: listAllProps) {
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
      orderBy: {
        codigo: 'desc',
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
}
