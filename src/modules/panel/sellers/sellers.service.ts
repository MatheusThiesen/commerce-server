import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

type listAllProps = {
  page: number;
  pagesize: number;
};

@Injectable()
export class PanelSellersService {
  readonly directorCode = 867;

  constructor(
    private prisma: PrismaService,
    private getRoleBySeller: GetRoleBySeller,
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

  async findAll({ page, pagesize }: listAllProps) {
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
      orderBy: {
        codigo: 'desc',
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
