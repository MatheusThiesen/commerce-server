import { SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { DifferentiatedHierarchy } from './entities/differentiated-hierarchies.entity';

type listAllProps = {
  page: number;
  pagesize: number;
  search: string;
  orderby?: string;
};

@Injectable()
export class PanelDifferentiatedHierarchiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
  ) {}

  async findAll({ page, pagesize }: listAllProps) {
    const hierarchies = await this.prisma.alcadaDesconto.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        id: true,
        tipoUsuario: true,
        percentualAprovacao: true,
        percentualSolicitacao: true,
        hierarquia: true,
      },
      orderBy: [{ hierarquia: 'desc' }],
    });

    const hierarchiesTotal = await this.prisma.alcadaDesconto.count({});

    return {
      data: hierarchies,
      page,
      pagesize,
      total: hierarchiesTotal,
    };
  }

  async update(id: string, dto: DifferentiatedHierarchy) {
    const updated = await this.prisma.alcadaDesconto.update({
      data: dto,
      where: {
        id,
      },
    });

    return updated;
  }
}
