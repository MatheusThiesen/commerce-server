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
    query: object;
  }) {
    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
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
