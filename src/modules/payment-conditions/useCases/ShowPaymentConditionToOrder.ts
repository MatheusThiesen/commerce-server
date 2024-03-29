import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

type ShowPaymentConditionToOrderProps = {
  brandCod: number;
  priceListCod: number;
  totalAmount: number;

  clientCod: number;
  stockLocationPeriod: string;
  isDifferentiated?: boolean;
};

@Injectable()
export class ShowPaymentConditionToOrder {
  constructor(private prisma: PrismaService) {}

  async execute({
    brandCod,
    totalAmount,
    priceListCod,
    clientCod,
    stockLocationPeriod,
    isDifferentiated,
  }: ShowPaymentConditionToOrderProps) {
    const paymentConditionRole =
      await this.prisma.regraCondicaoPagamento.findMany({
        select: {
          condicaoPagamento: {
            select: {
              codigo: true,
              descricao: true,
            },
          },
        },
        where: {
          marcaCodigo: brandCod,
          listaPrecoCodigo: priceListCod,
          eAtivo: true,
          valorMinimo: {
            lte: totalAmount,
          },
          eApenasDiferenciado: isDifferentiated ? undefined : false,
        },
      });

    return {
      brandCod,
      totalAmount,
      priceListCod,
      clientCod,
      stockLocationPeriod,
      paymentConditions: paymentConditionRole.map(
        (paymentCondition) => paymentCondition.condicaoPagamento,
      ),
    };
  }
}
