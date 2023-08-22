import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrderApiErp } from './RequestOrderApiErp';

@Injectable()
export class TransformOrderToSendApiErp {
  constructor(private prisma: PrismaService) {}

  addZerosToLeft(number: number, width: number) {
    return number.toString().padStart(width, '0');
  }

  async execute(orderCode: number): Promise<OrderApiErp> {
    const findOrder = await this.prisma.pedido.findUnique({
      select: {
        clienteCodigo: true,
        dataFaturamento: true,
        condicaoPagamentoCodigo: true,
        localCobrancaCodigo: true,
        itens: {
          select: {
            produtoCodigo: true,
            quantidade: true,
            valorUnitario: true,
          },
        },
        vendedores: {
          select: {
            vendedorCodigo: true,
            tipo: true,
          },
        },
      },
      where: {
        codigo: orderCode,
      },
    });

    if (!findOrder) throw new Error('Order not found');

    const representative = findOrder.vendedores.find(
      (vendedor) => vendedor.tipo === 1,
    )?.vendedorCodigo;
    const agent = findOrder.vendedores.find(
      (vendedor) => vendedor.tipo === 2,
    )?.vendedorCodigo;

    if (!representative) throw new Error('Not seller in order');

    const deliveryDateDay = this.addZerosToLeft(
      findOrder.dataFaturamento.getDate(),
      2,
    );
    const deliveryDateMonth = this.addZerosToLeft(
      findOrder.dataFaturamento.getMonth() + 1,
      2,
    );

    const deliveryDateYear = this.addZerosToLeft(
      findOrder.dataFaturamento.getFullYear(),
      2,
    );

    return {
      customer: findOrder.clienteCodigo,
      payment: findOrder.condicaoPagamentoCodigo,
      representative: representative,
      agent: agent ?? representative,
      deliveryDate: `${deliveryDateYear}-${deliveryDateMonth}-${deliveryDateDay}`,
      paymentLocal: findOrder.localCobrancaCodigo,

      items: findOrder.itens.map((item) => ({
        price: item.valorUnitario,
        product: item.produtoCodigo,
        quantity: item.quantidade,
        stockLocation: 20,
      })),
    };
  }
}
