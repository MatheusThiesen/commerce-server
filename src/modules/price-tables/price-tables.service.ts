import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from '../../utils/StringToNumberOrUndefined.utils';
import { CreatePriceTableDto } from './dto/create-price-table.dto';
import { UpdatePriceTableDto } from './dto/update-price-table.dto';
import { PriceTable } from './entities/price-table.entity';

@Injectable()
export class PriceTablesService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private readonly stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  async create(createPriceTableDto: CreatePriceTableDto) {
    const priceTable = new PriceTable();
    Object.assign(priceTable, {
      ...createPriceTableDto,
    });

    const priceTableExists = await this.prisma.tabelaPreco.findUnique({
      where: {
        codigo: priceTable.codigo,
      },
    });

    if (priceTableExists) {
      throw new Error('Price table already exists');
    }

    const created = await this.prisma.tabelaPreco.create({
      data: {
        codigo: priceTable.codigo,
        descricao: priceTable.descricao,
        eAtivo: priceTable.eAtivo,
      },
    });

    return created;
  }

  async findOne(codigo: number) {
    const priceTable = await this.prisma.tabelaPreco.findUnique({
      select: { codigo: true, descricao: true },
      where: { codigo },
    });
    if (!priceTable) {
      throw new Error('Price Table does not exist');
    }
    return priceTable;
  }

  async update(codigo: number, updatePriceTableDto: UpdatePriceTableDto) {
    const priceTable = new PriceTable();
    Object.assign(priceTable, {
      ...updatePriceTableDto,
    });

    await this.findOne(codigo);

    const updatedPriceList = await this.prisma.tabelaPreco.update({
      data: priceTable,
      where: { codigo },
    });

    return updatedPriceList;
  }

  async findAll() {
    const priceLists = await this.prisma.tabelaPreco.findMany({
      select: {
        codigo: true,
        descricao: true,
      },
      where: {
        eVenda: true,
        eAtivo: true,
      },
    });
    return priceLists;
  }

  async import(file: Express.Multer.File) {
    const pricesTable = await this.parseCsv.execute(file);

    for (const pricesTableArr of pricesTable) {
      const [codigo, descricao, ativo] = pricesTableArr;

      const priceTable = new PriceTable();
      Object.assign(priceTable, {
        codigo: this.stringToNumberOrUndefined.execute(codigo),
        descricao: descricao,
        eAtivo: Number(ativo) === 1,
      });

      const priceTableExists = await this.prisma.tabelaPreco.findUnique({
        where: {
          codigo: priceTable.codigo,
        },
      });

      try {
        if (priceTableExists) {
          await this.update(priceTableExists.codigo, priceTable);
        } else {
          await this.create(priceTable);
        }
      } catch (error) {
        console.log(error);
      }
    }

    return;
  }
}
