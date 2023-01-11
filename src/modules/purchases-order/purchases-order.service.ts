import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { CreatePurchasesOrderDto } from './dto/create-purchases-order.dto';
import { UpdatePurchasesOrderDto } from './dto/update-purchases-order.dto';
import { PurchasesOrder } from './entities/purchases-order.entity';

@Injectable()
export class PurchasesOrderService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createPurchasesOrderDto: CreatePurchasesOrderDto) {
    const purchasesOrder = new PurchasesOrder();
    Object.assign(purchasesOrder, createPurchasesOrderDto);

    const purchasesOrderExists = await this.prisma.ordemCompra.findUnique({
      where: {
        codigo: purchasesOrder.codigo,
      },
    });

    if (purchasesOrderExists) {
      throw new Error('PurchasesOrder already exists');
    }

    const createdPurchasesOrder = await this.prisma.ordemCompra.create({
      data: purchasesOrder,
    });

    return createdPurchasesOrder;
  }

  async findOne(codigo: string) {
    const purchasesOrder = await this.prisma.ordemCompra.findUnique({
      where: { codigo },
    });

    if (!purchasesOrder) {
      throw new Error('purchases Order does not exist');
    }

    return purchasesOrder;
  }

  async update(
    codigo: string,
    updatePurchasesOrderDto: UpdatePurchasesOrderDto,
  ) {
    const purchasesOrder = new PurchasesOrder();

    Object.assign(purchasesOrder, updatePurchasesOrderDto);

    await this.findOne(codigo);
    const updatedPurchasesOrder = await this.prisma.ordemCompra.update({
      data: purchasesOrder,
      where: { codigo },
    });

    return updatedPurchasesOrder;
  }

  async import(file: Express.Multer.File) {
    const purchasesOrder = await this.parseCsv.execute(file);

    for (const purchaseOrderArr of purchasesOrder) {
      const [codigo, periodo, nome, produtoCodigo, quantidade, situacao] =
        purchaseOrderArr;

      const purchasesOrder = new PurchasesOrder();
      Object.assign(purchasesOrder, {
        codigo: String(codigo),
        periodo: periodo,
        nome: nome,
        quantidade: Number(quantidade),
        produtoCodigo: Number(produtoCodigo),
        eAtivo: [2].includes(Number(situacao)),
      });

      const purchasesOrderExists = await this.prisma.ordemCompra.findUnique({
        where: {
          codigo: purchasesOrder.codigo,
        },
      });

      if (purchasesOrderExists) {
        await this.update(purchasesOrderExists.codigo, purchasesOrder);
      } else {
        await this.create(purchasesOrder);
      }
    }

    return;
  }
}
