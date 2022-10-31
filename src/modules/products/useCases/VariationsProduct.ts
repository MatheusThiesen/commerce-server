import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VariationsProduct {
  constructor(private prisma: PrismaService) {}

  async execute({ cod }: { cod: number }) {
    const product = await this.prisma.produto.findUnique({
      where: {
        codigo: cod,
      },
    });

    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
      },
      where: {
        codigoAlternativo: product.codigoAlternativo,
        colecaoCodigo: product.colecaoCodigo,
      },
    });
    return products;
  }
}
