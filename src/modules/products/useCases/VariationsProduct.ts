import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VariationsProduct {
  constructor(private prisma: PrismaService) {}

  async execute({
    alternativeCode,
    query,
  }: {
    alternativeCode: string;
    query: any;
  }) {
    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        locaisEstoque: {
          orderBy: {
            data: 'asc',
          },
          select: {
            id: true,
            descricao: true,
            quantidade: true,
          },
          where: {
            ...query?.locaisEstoque?.some,
          },
        },
      },
      orderBy: {
        referencia: 'desc',
      },
      where: {
        codigoAlternativo: alternativeCode,

        ...query,
      },
    });
    return products;
  }
}
