import { SendOrderErpApiProducerService } from '@/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { Differentiated } from '../entities/differentiated.entity';
import { GetPendencyBySellerCod } from './GetPendencyBySellerCod';
import { GetRoleBySeller } from './GetRoleBySeller';

interface ApprovalDifferentiatedProps {
  differentiated?: Differentiated;
  userId: string;
  orderCode: number;
}

@Injectable()
export class ApprovalDifferentiated {
  constructor(
    private prisma: PrismaService,
    private getRoleBySeller: GetRoleBySeller,
    private getPendencyBySellerCod: GetPendencyBySellerCod,
    private readonly sendOrderErpApiProducerService: SendOrderErpApiProducerService,
  ) {}

  async execute({
    userId,
    differentiated,
    orderCode,
  }: ApprovalDifferentiatedProps) {
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
        vendedorCodigo: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const sellerRole = await this.getRoleBySeller.execute(user.vendedorCodigo);

    const authority = await this.prisma.alcadaDesconto.findFirst({
      where: {
        tipoUsuario: sellerRole,
      },
    });

    const normalizedDiscountPercent =
      differentiated.tipoDesconto === 'PERCENTUAL'
        ? differentiated.descontoPercentual
        : (differentiated.descontoValor / order.valorTotal) * 100;

    const descontoCalculado =
      order.valorTotal * (normalizedDiscountPercent / 100);

    const vendedorPendenteDiferenciadoCodigo =
      await this.getPendencyBySellerCod.execute({
        sellerCode: user.vendedorCodigo,
        brandCode: order.marcaCodigo,
      });

    if (
      Number(authority.percentualAprovacao) >= Number(normalizedDiscountPercent)
    ) {
      await this.prisma.diferenciado.create({
        data: {
          eFinalizado: true,
          dataFinalizado: new Date(),
          eAprovado: true,
          pedidoCodigo: order.codigo,
          tipoDesconto: differentiated.tipoDesconto,
          descontoPercentual: differentiated.descontoPercentual,
          descontoValor: differentiated.descontoValor,
          motivoDiferenciado: differentiated.motivoDiferenciado,
          tipoUsuario: sellerRole,
          vendedorCodigo: user.vendedorCodigo,
          passo: lastDifferentiated.passo + 1,
          descontoCalculado: descontoCalculado,
        },
      });

      await this.prisma.pedido.update({
        where: {
          codigo: order.codigo,
        },
        data: {
          situacaoPedidoCodigo: 1,
          eDiferenciadoFinalizado: true,
          tipoDesconto: differentiated.tipoDesconto,
          descontoPercentual: differentiated.descontoPercentual,
          descontoValor: differentiated.descontoValor,
          descontoCalculado: descontoCalculado,
          vendedorPendenteDiferenciadoCodigo: null,
        },
      });

      await this.sendOrderErpApiProducerService.execute({
        orderCode: order.codigo,
      });
    } else {
      if (
        Number(authority.percentualSolicitacao) >=
        Number(normalizedDiscountPercent)
      ) {
        await this.prisma.diferenciado.create({
          data: {
            pedidoCodigo: order.codigo,
            tipoDesconto: differentiated.tipoDesconto,
            descontoPercentual: differentiated.descontoPercentual,
            descontoValor: differentiated.descontoValor,
            motivoDiferenciado: differentiated.motivoDiferenciado,
            tipoUsuario: sellerRole,
            vendedorCodigo: user.vendedorCodigo,
            passo: lastDifferentiated.passo + 1,
            descontoCalculado: descontoCalculado,
          },
        });

        await this.prisma.pedido.update({
          where: {
            codigo: order.codigo,
          },
          data: {
            tipoDesconto: differentiated.tipoDesconto,
            descontoPercentual: differentiated.descontoPercentual,
            descontoValor: differentiated.descontoValor,
            descontoCalculado: descontoCalculado,
            vendedorPendenteDiferenciadoCodigo:
              vendedorPendenteDiferenciadoCodigo,
          },
        });
      }
    }

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
