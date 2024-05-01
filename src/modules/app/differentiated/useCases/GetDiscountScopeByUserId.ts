import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetRoleBySeller } from './GetRoleBySeller';

interface GetDiscountScopeByUserIdProps {
  userId: string;
}

@Injectable()
export class GetDiscountScopeByUserId {
  readonly directorCode = 867;

  constructor(
    private prisma: PrismaService,
    private getRoleBySeller: GetRoleBySeller,
  ) {}

  async execute({ userId }: GetDiscountScopeByUserIdProps) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,
        vendedorCodigo: true,
        vendedor: {
          select: {
            eDiretor: true,
            eGerente: true,
            eSupervisor: true,
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

    const sellerRole = await this.getRoleBySeller.execute(user.vendedorCodigo);

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
