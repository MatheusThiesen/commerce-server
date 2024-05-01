import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ListingRule } from './ListingRule';

@Injectable()
export class AgroupGridProduct {
  constructor(
    private prisma: PrismaService,
    private readonly listingRule: ListingRule,
  ) {}

  async execute({ reference, query }: { reference: string; query?: any }) {
    const normalizedQuery = query ? query : undefined;

    const normalizedFilterStockLocation = {
      ...this.listingRule.execute()?.locaisEstoque?.some,
      ...query?.locaisEstoque?.some,
    };

    const products = await this.prisma.produto.findMany({
      select: {
        codigo: true,
        descricaoAdicional: true,
        precoVenda: true,
        precoTabela28: true,
        locaisEstoque: {
          orderBy: {
            data: 'asc',
          },
          select: {
            id: true,
            descricao: true,
            quantidade: true,
          },

          where: normalizedFilterStockLocation,
        },
      },
      where: {
        AND: [normalizedQuery, this.listingRule.execute()],
        referencia: reference,
      },
    });
    return products;
  }
}
