import { Injectable } from '@nestjs/common';
import { ItemFilter } from 'src/@types/FilterList';
import { GroupByObj } from 'src/utils/GroupByObj.utils';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

interface ListAllProps {
  userId: string;
  filters: ItemFilter[];
}

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private groupByObj: GroupByObj,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const brand = new Brand();
    Object.assign(brand, createBrandDto);

    const brandExists = await this.prisma.marca.findUnique({
      where: {
        codigo: brand.codigo,
      },
    });

    if (brandExists) {
      throw new Error('Brand already exists');
    }

    const createdBrand = await this.prisma.marca.create({
      data: brand,
    });

    return createdBrand;
  }

  async findAll({ filters }: ListAllProps) {
    let filterNormalized = [];

    if (filters) {
      const groupFilters = this.groupByObj.execute(
        filters,
        (item) => item.name,
      );

      filterNormalized = [
        ...filterNormalized,
        ...groupFilters.map((filterGroup) => ({
          [filterGroup.value as string]: {
            in: filterGroup.data.map((item) => item.value),
          },
        })),
      ];
    }

    const brands = await this.prisma.marca.findMany({
      select: {
        codigo: true,
        descricao: true,
        valorPedidoMinimo: true,
      },
      where: {
        eVenda: true,
        AND: [...filterNormalized],
      },
    });
    return brands;
  }

  async findOne(codigo: number) {
    const brand = await this.prisma.marca.findUnique({ where: { codigo } });

    if (!brand) {
      throw new Error('Brand does not exist');
    }

    return brand;
  }

  async update(codigo: number, updateBrandDto: UpdateBrandDto) {
    const brand = new Brand();
    Object.assign(brand, updateBrandDto);

    await this.findOne(codigo);

    const updatedBrand = await this.prisma.marca.update({
      data: brand,
      where: { codigo },
    });

    return updatedBrand;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.marca.delete({ where: { codigo } });
    return;
  }

  async import(file: Express.Multer.File) {
    const brands = await this.parseCsv.execute(file);

    for (const brandArr of brands) {
      const [codigo, descricao, eAtivo] = brandArr;

      const brand = new Brand();
      Object.assign(brand, {
        codigo: Number(codigo),
        descricao: descricao,
        eAtivo: eAtivo === 1,
      });

      const brandExists = await this.prisma.marca.findUnique({
        where: {
          codigo: brand.codigo,
        },
      });

      if (brandExists) {
        await this.update(brandExists.codigo, brand);
      } else {
        await this.create(brand);
      }
    }

    return;
  }
}
