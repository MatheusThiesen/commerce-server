import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetRoleBySeller } from './GetRoleBySeller';

interface GetPendencyBySellerCodProps {
  sellerCode: number;
  brandCode: number;
}

@Injectable()
export class GetPendencyBySellerCod {
  readonly directorCode = 867;

  constructor(
    private prisma: PrismaService,
    private getRoleBySeller: GetRoleBySeller,
  ) {}

  async execute({
    sellerCode,
    brandCode,
  }: GetPendencyBySellerCodProps): Promise<number> {
    const seller = await this.prisma.vendedor.findUnique({
      where: {
        codigo: sellerCode,
      },
    });

    if (!seller) {
      throw new Error('Vendedor não encontrado.');
    }

    const brand = await this.prisma.marca.findUnique({
      where: {
        codigo: brandCode,
      },
    });

    if (!brand) {
      throw new Error('Marca não encontrado.');
    }

    const sellerRole = await this.getRoleBySeller.execute(seller.codigo);

    switch (sellerRole) {
      case 'VENDEDOR':
        if (seller.codSupervisor) {
          return seller.codSupervisor;
        }

        if (seller.codGerente) {
          return seller.codGerente;
        }

        const manager = await this.prisma.vendedor.findFirst({
          where: {
            eAtivo: true,
            eGerente: true,
            marcas: {
              some: {
                codigo: brand.codigo,
              },
            },
          },
          orderBy: {
            codigo: 'desc',
          },
        });

        if (manager) {
          return manager.codigo;
        }

      case 'GERENTE':
        if (seller.codDiretor) {
          return seller.codDiretor;
        }
        return this.directorCode;
    }

    return this.directorCode;
  }
}
