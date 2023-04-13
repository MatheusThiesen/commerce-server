import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AgroupGridProduct {
  constructor(private prisma: PrismaService) {}

  async execute({ reference, query }: { reference: string; query: any }) {
    const products = await this.prisma.produto.findMany({
      select: {
        codigo: true,
        descricaoAdicional: true,
        precoVenda: true,
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
      where: {
        referencia: reference,
        ...query,
      },
    });
    return products;
  }
}
