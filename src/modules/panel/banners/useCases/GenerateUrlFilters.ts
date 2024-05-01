import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateUrlFilters {
  constructor(private prisma: PrismaService) {}
  async execute(bannerId: string) {
    const banner = await this.prisma.banner.findUnique({
      select: {
        id: true,
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
      where: {
        id: bannerId,
      },
    });

    if (!banner) throw new Error('Banner already exists');

    const url = new URL(`${process.env.FRONTEND_URL}/produtos/`);

    for (const brand of banner.marcas) {
      url.searchParams.append(
        'marcaCodigo',
        `${brand.descricao}|${brand.codigo}`,
      );
    }
    for (const collection of banner.colecoes) {
      url.searchParams.append(
        'colecaoCodigo',
        `${collection.descricao}|${collection.codigo}`,
      );
    }
    for (const stock of banner.locaisEstoque) {
      url.searchParams.append(
        'locaisEstoque',
        `${stock.descricao}|${stock.periodo}`,
      );
    }
    for (const group of banner.grupos) {
      url.searchParams.append(
        'grupoCodigo',
        `${group.descricao}|${group.codigo}`,
      );
    }
    for (const genre of banner.generos) {
      url.searchParams.append(
        'generoCodigo',
        `${genre.descricao}|${genre.codigo}`,
      );
    }
    for (const line of banner.linhas) {
      url.searchParams.append(
        'linhaCodigo',
        `${line.descricao}|${line.codigo}`,
      );
    }

    await this.prisma.banner.update({
      data: {
        urlSearch: url.search,
      },
      where: {
        id: bannerId,
      },
    });
  }
}
