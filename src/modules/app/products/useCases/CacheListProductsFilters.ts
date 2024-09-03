import { PrismaService } from '@/database/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
import { ListProductsFilters } from './ListProductsFilters';

@Injectable()
export class CacheListProductsFilters {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private listProductsFilters: ListProductsFilters,
    private prisma: PrismaService,
  ) {}

  @Cron('0 0 7,12 */1 * *', {
    timeZone: 'America/Sao_Paulo',
  })
  async execute() {
    const sellers = await this.prisma.vendedor.findMany({
      select: {
        marcas: {
          select: {
            codigo: true,
          },
          where: {
            eVenda: true,
          },
        },
      },
      where: {
        eAtivo: true,
      },
    });

    const cacheKey = `products-filters-`;

    const getFiltersAllBrand = await this.listProductsFilters.execute({});

    await this.redis.set(
      `${cacheKey}`,
      JSON.stringify(getFiltersAllBrand),
      'EX',
      60 * 60 * 24 * 1,
    );

    for (const seller of sellers) {
      const filters = seller.marcas.map((brand) => ({
        value: brand.codigo,
        name: 'marcaCodigo',
      }));

      const cacheKeySeller = `${cacheKey}${filters
        .map((item) => `${item.name}-${item.value}`)
        .join('-')}`;

      const normalized = await this.listProductsFilters.execute({
        filters: seller.marcas.map((brand) => ({
          name: 'marcaCodigo',
          value: brand.codigo,
        })),
      });

      await this.redis.set(
        cacheKeySeller,
        JSON.stringify(normalized),
        'EX',
        60 * 60 * 24 * 1,
      );
    }
  }
}
