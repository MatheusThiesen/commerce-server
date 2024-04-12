import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from 'src/utils/StringToNumberOrUndefined.utils';
import { CreateBillingLocationDto } from './dto/create-billing-location.dto';
import { UpdateBillingLocationDto } from './dto/update-billing-location.dto';
import { BillingLocation } from './entities/billing-location.entity';

@Injectable()
export class BillingLocationsService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private readonly stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  async create(createBillingLocationDto: CreateBillingLocationDto) {
    const billingLocation = new BillingLocation();
    Object.assign(billingLocation, {
      ...createBillingLocationDto,
    });

    const billingLocationExists = await this.prisma.localCobranca.findUnique({
      where: {
        codigo: billingLocation.codigo,
      },
    });

    if (billingLocationExists) {
      throw new Error('Billing Location already exists');
    }

    const created = await this.prisma.localCobranca.create({
      data: {
        codigo: billingLocation.codigo,
        descricao: billingLocation.descricao,
      },
    });

    return created;
  }

  async findOne(codigo: number) {
    const billingLocation = await this.prisma.localCobranca.findUnique({
      select: { codigo: true, descricao: true },
      where: { codigo },
    });
    if (!billingLocation) {
      throw new Error('Billing Location does not exist');
    }
    return billingLocation;
  }

  async update(
    codigo: number,
    updateBillingLocationDto: UpdateBillingLocationDto,
  ) {
    const billingLocation = new BillingLocation();
    Object.assign(billingLocation, {
      ...updateBillingLocationDto,
    });

    await this.findOne(codigo);

    const updatedPriceList = await this.prisma.localCobranca.update({
      data: billingLocation,
      where: { codigo },
    });

    return updatedPriceList;
  }

  async import(file: Express.Multer.File) {
    const billingLocations = await this.parseCsv.execute(file);

    for (const billingLocationsArr of billingLocations) {
      const [codigo, descricao, ativo] = billingLocationsArr;

      const priceTable = new BillingLocation();
      Object.assign(priceTable, {
        codigo: this.stringToNumberOrUndefined.execute(codigo),
        descricao: descricao,
        eAtivo: Number(ativo) === 1,
      });

      const priceTableExists = await this.prisma.localCobranca.findUnique({
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
