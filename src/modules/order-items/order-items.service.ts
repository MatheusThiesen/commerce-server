import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { UpdateStockFuture } from '../stock/useCases/updateStockFuture';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private updateStockFuture: UpdateStockFuture,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    const orderItem = new OrderItem();
    Object.assign(orderItem, createOrderItemDto);

    const itemExists = await this.prisma.itemPedido.findUnique({
      where: {
        pedidoCodigo_produtoCodigo_sequencia: {
          pedidoCodigo: orderItem.pedidoCodigo,
          produtoCodigo: orderItem.produtoCodigo,
          sequencia: orderItem.sequencia,
        },
      },
    });

    if (itemExists) {
      throw new Error('item already exists');
    }

    const existProduct = await this.prisma.produto.findUnique({
      where: {
        codigo: orderItem.produtoCodigo,
      },
    });

    if (!existProduct) {
      this.prisma.produtoNaoImportado.create({
        data: {
          codigo: orderItem.produtoCodigo,
        },
      });

      throw new BadRequestException('Product does not exist');
    }

    const orderExists = await this.prisma.pedido.findUnique({
      where: {
        codigo: orderItem.pedidoCodigo,
      },
    });
    if (!orderExists) {
      await this.prisma.pedido.create({
        data: {
          codigo: orderItem.pedidoCodigo,
          dataFaturamento: orderItem.dataFaturmaneto,
        },
      });
    }

    delete orderItem.dataFaturmaneto;

    const createdItem = await this.prisma.itemPedido.create({
      data: orderItem,
    });

    await this.updateStockFuture.execute(orderItem.produtoCodigo);

    return createdItem;
  }

  async findOne(codigo: string) {
    const item = await this.prisma.itemPedido.findUnique({
      where: { codigo },
    });

    if (!item) {
      throw new Error('Order Item does not exist');
    }

    return item;
  }

  async update(codigo: string, updateOrderItemDto: UpdateOrderItemDto) {
    const item = new OrderItem();

    Object.assign(item, updateOrderItemDto);

    await this.findOne(codigo);

    if (item.pedidoCodigo) {
      const orderExists = await this.prisma.pedido.findUnique({
        where: {
          codigo: item.pedidoCodigo,
        },
      });
      if (!orderExists) {
        await this.prisma.pedido.create({
          data: {
            codigo: item.pedidoCodigo,
            dataFaturamento: item.dataFaturmaneto,
          },
        });
      }
    }

    delete item.dataFaturmaneto;

    const updatedItem = await this.prisma.itemPedido.update({
      data: item,
      where: { codigo },
    });

    await this.updateStockFuture.execute(item.produtoCodigo);

    return updatedItem;
  }

  async import(file: Express.Multer.File) {
    const orderItems = await this.parseCsv.execute(file);

    for (const orderItemsArr of orderItems) {
      const [
        pedidoCodigo,
        produtoCodigo,
        dataFaturmaneto,
        _codigo,
        situacao,
        quantidade,
        valorUnitaro,
        valorTotal,
        sequencia,
      ] = orderItemsArr;

      const orderItem = new OrderItem();

      Object.assign(orderItem, {
        // codigo: codigo,
        quantidade: Number(quantidade),
        valorUnitaro: Number(valorUnitaro),
        valorTotal: Number(valorTotal),
        situacao: Number(situacao),
        pedidoCodigo: Number(pedidoCodigo),
        produtoCodigo: Number(produtoCodigo),
        dataFaturmaneto: new Date(dataFaturmaneto),
        sequencia: Number(sequencia),
      });

      const itemExists = await this.prisma.itemPedido.findUnique({
        where: {
          pedidoCodigo_produtoCodigo_sequencia: {
            pedidoCodigo: orderItem.pedidoCodigo,
            produtoCodigo: orderItem.produtoCodigo,
            sequencia: orderItem.sequencia,
          },
        },
      });

      if (itemExists) {
        await this.update(itemExists.codigo, orderItem);
      } else {
        await this.create(orderItem);
      }
    }

    return;
  }
}
