import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

type role = 'DIRETOR' | 'SUPERVISOR' | 'GERENTE' | 'VENDEDOR';

@Injectable()
export class GetRoleBySeller {
  constructor(private prisma: PrismaService) {}

  async execute(sellerCode: number): Promise<role> {
    const seller = await this.prisma.vendedor.findUnique({
      where: {
        codigo: sellerCode,
      },
    });

    if (!seller) {
      throw new Error('Seller not exists');
    }

    const sellerRole = seller.eDiretor
      ? 'DIRETOR'
      : seller.eGerente
      ? 'GERENTE'
      : seller.eSupervisor
      ? 'SUPERVISOR'
      : 'VENDEDOR';

    return sellerRole;
  }
}
