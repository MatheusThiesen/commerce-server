import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/ParseCsv';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

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

  async findAll() {
    const brands = await this.prisma.marca.findMany();
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
        eAtivo: eAtivo?.toLowerCase() === 's',
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
