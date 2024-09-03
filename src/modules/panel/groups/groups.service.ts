import { PrismaService } from '@/database/prisma.service';
import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';
import { Group } from './entities/group.entity';

type listAllProps = {
  page: number;
  pagesize: number;
  search: string;
  orderby?: string;
};

@Injectable()
export class PanelGroupsService {
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'descricao',
      type: 'string',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
  ) {}

  async findAll({ page, pagesize, search, orderby }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const groups = await this.prisma.grupo.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        codigo: true,
        descricao: true,
        ornador: true,
        eAtivo: true,
        eVenda: true,
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'asc' }],
      where: {
        AND: [{ OR: this.searchFilter.execute(search, this.fieldsSearch) }],
      },
    });

    const brandsTotal = await this.prisma.grupo.count({
      where: {
        AND: [{ OR: this.searchFilter.execute(search, this.fieldsSearch) }],
      },
    });

    return {
      data: groups,
      page,
      pagesize,
      total: brandsTotal,
    };
  }

  async update(codigo: number, dto: Group) {
    const updated = await this.prisma.grupo.update({
      data: dto,
      where: {
        codigo,
      },
    });

    return updated;
  }
}
