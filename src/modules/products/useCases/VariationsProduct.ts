import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ProductsService } from '../products.service';

@Injectable()
export class VariationsProduct {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

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
            ...this.productsService.listingRule().locaisEstoque.some,
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
