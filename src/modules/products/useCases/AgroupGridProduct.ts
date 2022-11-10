import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AgroupGridProduct {
  constructor(private prisma: PrismaService) {}

  async execute({ reference, query }: { reference: string; query: object }) {
    const products = await this.prisma.produto.findMany({
      select: {
        codigo: true,
        descricaoAdicional: true,
      },
      where: {
        referencia: reference,
        ...query,
      },
    });
    return products;
  }
}
