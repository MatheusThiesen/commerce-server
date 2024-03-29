import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

interface ReprovalDifferentiatedProps {
  userId: string;
  reason?: string;
  orderCode: number;
}

@Injectable()
export class ReprovalDifferentiated {
  constructor(private prisma: PrismaService) {}

  async execute({ userId, orderCode, reason }: ReprovalDifferentiatedProps) {
    const order = await this.prisma.pedido.findUnique({
      where: {
        codigo: orderCode,
      },
    });

    const lastDifferentiated = await this.prisma.diferenciado.findFirst({
      where: {
        pedidoCodigo: orderCode,
      },
      orderBy: {
        passo: 'desc',
      },
    });

    const user = await this.prisma.usuario.findUnique({
      select: {
        eVendedor: true,

        vendedor: {
          select: {
            codGerente: true,
            codigo: true,
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

    if (!user) {
      throw new Error('User not found');
    }

    const sellerRole = user.vendedor.eDiretor
      ? 'DIRETOR'
      : user.vendedor.eGerente
      ? 'GERENTE'
      : 'VENDEDOR';

    if (order.vendedorPendenteDiferenciadoCodigo !== user.vendedor.codigo) {
      throw new Error('Not permission');
    }

    await this.prisma.pedido.update({
      where: {
        codigo: order.codigo,
      },
      data: {
        situacaoPedidoCodigo: 8,
        eDiferenciadoFinalizado: true,
        vendedorPendenteDiferenciadoCodigo: null,
      },
    });

    await this.prisma.diferenciado.create({
      data: {
        eFinalizado: true,
        dataFinalizado: new Date(),
        tipoDesconto: order.tipoDesconto,
        pedidoCodigo: order.codigo,
        descontoPercentual: order.descontoPercentual,
        motivoDiferenciado: reason ?? undefined,
        vendedorCodigo: user.vendedor.codigo,
        passo: lastDifferentiated.passo + 1,
        descontoCalculado: order.descontoCalculado,
        eAprovado: false,
        tipoUsuario: sellerRole,
      },
    });

    await this.prisma.diferenciado.update({
      data: {
        eFinalizado: true,
        dataFinalizado: new Date(),
      },
      where: {
        id: lastDifferentiated.id,
      },
    });

    return;
  }
}
