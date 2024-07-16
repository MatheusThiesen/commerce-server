import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderService } from '../order.service';

@Injectable()
export class RoutineSendAllOrdersApiErp {
  constructor(
    private readonly prisma: PrismaService,
    private orderService: OrderService,
  ) {}

  @Cron('0 0 */1 * * *', {
    timeZone: 'America/Sao_Paulo',
  })
  async execute() {
    // const orders = await this.prisma.pedido.findMany({
    //   select: { codigo: true },
    //   where: { codigoErp: null, situacaoPedidoCodigo: 1, eRascunho: false },
    // });
    // for (const order of orders) {
    //   await this.orderService.sendApiErp(order.codigo);
    // }
  }
}
