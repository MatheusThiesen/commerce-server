import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

interface GetDiscountScopeByUserIdProps {
  userId: string;
}

@Injectable()
export class GetDiscountScopeByUserId {
  readonly directorCode = 867;

  constructor(private prisma: PrismaService) {}

  async execute({ userId }: GetDiscountScopeByUserIdProps) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedor: {
          select: {
            eDiretor: true,
            eGerente: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user.eVendedor) {
      throw new Error('Vendedor não encontrado.');
    }

    const seller = user.vendedor;

    const sellerRole = seller.eDiretor
      ? 'DIRETOR'
      : seller.eGerente
      ? 'GERENTE'
      : 'VENDEDOR';

    const discountScope = await this.prisma.alcadaDesconto.findFirst({
      select: {
        id: true,
        hierarquia: true,
        tipoUsuario: true,
        percentualAprovacao: true,
        percentualSolicitacao: true,
      },
      where: {
        tipoUsuario: sellerRole,
      },
    });

    return {
      ...discountScope,
      percentualAprovacao: Number(discountScope.percentualAprovacao),
      percentualSolicitacao: Number(discountScope.percentualSolicitacao),
    };
  }
}
