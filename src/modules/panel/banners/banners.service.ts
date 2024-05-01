import { OrderBy } from '@/utils/OrderBy.utils';
import { FieldsProps, SearchFilter } from '@/utils/SearchFilter.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Banner } from './entities/banners.entity';
import { GenerateUrlFilters } from './useCases/GenerateUrlFilters';

type listAllProps = {
  page: number;
  pagesize: number;
  search: string;
  orderby?: string;
};

@Injectable()
export class PanelBannersService {
  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'id',
      type: 'string',
    },
    {
      name: 'titulo',
      type: 'string',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
    private readonly generateUrlFilters: GenerateUrlFilters,
  ) {}

  async findOne(id: string) {
    const banner = await this.prisma.banner.findFirst({
      select: {
        id: true,
        titulo: true,
        qtdClicks: true,
        eAtivo: true,

        imagemDesktop: {
          select: {
            id: true,
            nome: true,
            url: true,
            tamanho: true,
            tipoArquivo: true,
          },
        },
        imagemMobile: {
          select: {
            id: true,
            nome: true,
            url: true,
            tamanho: true,
            tipoArquivo: true,
          },
        },

        marcas: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        colecoes: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        locaisEstoque: {
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
        generos: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        linhas: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      where: { id },
    });

    if (!banner) {
      throw new Error('banner does not exist');
    }

    return banner;
  }

  async findAll({ page, pagesize, search, orderby }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const banners = await this.prisma.banner.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        id: true,
        titulo: true,
        qtdClicks: true,
        eAtivo: true,
        marcas: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      orderBy: [orderByNormalized] ?? [{ createdAt: 'desc' }],
      where: {
        AND: [{ OR: this.searchFilter.execute(search, this.fieldsSearch) }],
      },
    });

    const bannersTotal = await this.prisma.banner.count({});

    return {
      data: banners,
      page,
      pagesize,
      total: bannersTotal,
    };
  }

  async create({
    titulo,
    imagemDesktopId,
    imagemMobileId,

    colecoes,
    locaisEstoque,
    marcas,
    grupos,
    generos,
    linhas,
  }: Banner) {
    const banner = await this.prisma.banner.create({
      data: {
        titulo,
        imagemDesktopId,
        imagemMobileId,

        colecoes: {
          connect: colecoes.map((item) => ({
            codigo: +item,
          })),
        },
        locaisEstoque: {
          connect: locaisEstoque.map((item) => ({
            periodo: item,
          })),
        },
        marcas: {
          connect: marcas.map((item) => ({
            codigo: +item,
          })),
        },
        grupos: {
          connect: grupos.map((item) => ({
            codigo: +item,
          })),
        },
        generos: {
          connect: generos.map((item) => ({
            codigo: +item,
          })),
        },
        linhas: {
          connect: linhas.map((item) => ({
            codigo: +item,
          })),
        },
      },
    });

    await this.generateUrlFilters.execute(banner.id);

    return banner;
  }

  async update(
    id: string,
    {
      titulo,
      imagemDesktopId,
      imagemMobileId,
      eAtivo,

      colecoes,
      locaisEstoque,
      marcas,
      grupos,
      generos,
      linhas,
    }: Banner,
  ) {
    const banner = await this.prisma.banner.update({
      data: {
        titulo,
        imagemDesktopId,
        imagemMobileId,

        eAtivo,

        colecoes: {
          set: colecoes.map((item) => ({
            codigo: +item,
          })),
        },
        locaisEstoque: {
          set: locaisEstoque.map((item) => ({
            periodo: item,
          })),
        },
        marcas: {
          set: marcas.map((item) => ({
            codigo: +item,
          })),
        },
        grupos: {
          set: grupos.map((item) => ({
            codigo: +item,
          })),
        },
        generos: {
          set: generos.map((item) => ({
            codigo: +item,
          })),
        },
        linhas: {
          set: linhas.map((item) => ({
            codigo: +item,
          })),
        },
      },
      where: {
        id,
      },
    });

    await this.generateUrlFilters.execute(banner.id);

    return banner;
  }

  async click(id: string) {
    const banner = await this.prisma.banner.update({
      data: {
        qtdClicks: {
          increment: 1,
        },
      },
      where: {
        id,
      },
    });

    return banner;
  }
}
