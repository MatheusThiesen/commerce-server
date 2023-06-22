import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { ParseCsv } from '../../utils/ParseCsv.utils';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';
import { StockLocation } from './entities/stock-location.entity';

@Injectable()
export class StockLocationsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createStockLocationDto: CreateStockLocationDto) {
    const stockLocation = new StockLocation();
    Object.assign(stockLocation, createStockLocationDto);

    const stockLocationExists = await this.prisma.localEstoque.findUnique({
      select: {
        id: true,
      },
      where: {
        periodo_produtoCodigo: {
          periodo: stockLocation.periodo,
          produtoCodigo: stockLocation.produtoCodigo,
        },
      },
    });

    if (stockLocationExists) {
      return await this.update(stockLocationExists.id, stockLocation);
    }

    const existProduct = await this.prisma.produto.findUnique({
      where: {
        codigo: stockLocation.produtoCodigo,
      },
    });

    if (!existProduct) {
      await this.prisma.produtoNaoImportado.create({
        data: {
          codigo: stockLocation.produtoCodigo,
        },
      });

      throw new Error('Product does not exist');
    }

    const createdStockLocation = await this.prisma.localEstoque.create({
      data: stockLocation,
    });

    return createdStockLocation;
  }

  async update(id: string, updateStockLocationDto: UpdateStockLocationDto) {
    const stockLocation = new StockLocation();
    Object.assign(stockLocation, updateStockLocationDto);

    await this.findOne(id);

    const existProduct = await this.prisma.produto.findUnique({
      where: {
        codigo: stockLocation.produtoCodigo,
      },
    });

    if (!existProduct) {
      console.log(`Produto nao existe ${stockLocation.produtoCodigo}`);
      return;
      // throw new BadRequestException('Product does not exist');
    }

    const updatedStockLocation = await this.prisma.localEstoque.update({
      data: stockLocation,
      where: { id },
    });

    return updatedStockLocation;
  }

  async findOne(id: string) {
    const stockLocation = await this.prisma.localEstoque.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });

    if (!stockLocation) {
      throw new BadRequestException('StockLocation does not exist');
    }

    return stockLocation;
  }

  async import(file: Express.Multer.File) {
    const stockLocations = await this.parseCsv.execute(file);

    for (const stockLocationArr of stockLocations) {
      const [periodo, descricao, produtoCodigo, quantidade, data] =
        stockLocationArr;

      const stockLocation = new StockLocation();

      const monthCurrent = new Date().getMonth();
      const month = new Date(data).getMonth();

      Object.assign(stockLocation, {
        periodo: periodo,
        descricao: descricao,
        produtoCodigo: Number(produtoCodigo),
        quantidade: Number(quantidade),
        data: data,
        // eAtivo: periodo === 'pronta-entrega' ? true : monthCurrent >= month,
        eAtivo: true,
      });

      try {
        const stockLocationExists = await this.prisma.localEstoque.findUnique({
          select: {
            id: true,
          },
          where: {
            periodo_produtoCodigo: {
              periodo: stockLocation.periodo,
              produtoCodigo: stockLocation.produtoCodigo,
            },
          },
        });

        if (stockLocationExists) {
          await this.update(stockLocationExists.id, stockLocation);
        } else {
          await this.create(stockLocation);
        }
      } catch (error) {
        console.log(stockLocation);
        console.log(error);
      }
    }

    return;
  }
}
