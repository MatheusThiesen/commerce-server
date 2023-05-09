import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ListingRule } from './ListingRule';

@Injectable()
export class AgroupGridProduct {
  constructor(
    private prisma: PrismaService,
    private readonly listingRule: ListingRule,
  ) {}

  async execute({ reference, query }: { reference: string; query?: any }) {
    const normalizedQuery = query ? query : undefined;

    const normalizedQueryStock =
      query && query?.AND
        ? query?.AND.find((f) => {
            const [key] = Object.keys(f);

            return key === `locaisEstoque`;
          })
        : undefined;

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
            AND: [
              this.listingRule.execute()?.locaisEstoque?.some,
              normalizedQueryStock?.locaisEstoque?.some,
            ],
          },
        },
      },
      where: {
        AND: [
          this.listingRule.execute(),
          {
            referencia: reference,
          },
          normalizedQuery,
        ],
      },
    });
    return products;
  }
}
