import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    const orderItem = new OrderItem();
    Object.assign(orderItem, createOrderItemDto);

    const itemExists = await this.prisma.itemPedido.findUnique({
      where: {
        codigo: orderItem.codigo,
      },
    });

    if (itemExists) {
      throw new Error('item already exists');
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
        },
      });
    }

    const createdItem = await this.prisma.itemPedido.create({
      data: orderItem,
    });

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
          },
        });
      }
    }

    const updatedItem = await this.prisma.itemPedido.update({
      data: item,
      where: { codigo },
    });

    return updatedItem;
  }

  async import(file: Express.Multer.File) {
    const orderItems = await this.parseCsv.execute(file);

    for (const orderItemsArr of orderItems) {
      const [
        pedidoCodigo,
        produtoCodigo,
        codigo,
        situacao,
        quantidade,
        valorUnitaro,
        valorTotal,
      ] = orderItemsArr;

      const orderItem = new OrderItem();
      Object.assign(orderItem, {
        codigo: codigo,
        quantidade: Number(quantidade),
        valorUnitaro: Number(valorUnitaro),
        valorTotal: Number(valorTotal),
        situacao: Number(situacao),
        pedidoCodigo: Number(pedidoCodigo),
        produtoCodigo: Number(produtoCodigo),
      });

      const itemExists = await this.prisma.itemPedido.findUnique({
        where: {
          codigo: orderItem.codigo,
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
