import { Injectable } from '@nestjs/common';
import { ParseCsv } from 'src/utils/ParseCsv';
import { PrismaService } from '../../database/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Color } from './entities/color.entity';

@Injectable()
export class ColorsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createColorDto: CreateColorDto) {
    const color = new Color();
    Object.assign(color, createColorDto);

    const colorExists = await this.prisma.cor.findUnique({
      where: {
        codigo: createColorDto.codigo,
      },
    });

    if (colorExists) {
      throw new Error('Color already exists');
    }

    const createdColor = await this.prisma.cor.create({
      data: color,
    });

    return createdColor;
  }

  async findAll() {
    const colors = await this.prisma.cor.findMany();

    return colors;
  }

  async findOne(id: number) {
    const color = await this.prisma.cor.findUnique({
      where: {
        codigo: id,
      },
    });

    if (!color) {
      throw new Error('Color does not exist');
    }

    return color;
  }

  async update(codigo: number, updateColorDto: UpdateColorDto) {
    const color = new Color();
    Object.assign(color, updateColorDto);

    await this.findOne(codigo);

    const updetedColor = await this.prisma.cor.update({
      data: color,
      where: {
        codigo,
      },
    });

    return updetedColor;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);

    await this.prisma.cor.delete({
      where: { codigo },
    });

    return;
  }

  async import(file: Express.Multer.File) {
    const colors = await this.parseCsv.execute(file);

    for (const colorArr of colors) {
      const [codigo, descricao, hex] = colorArr;

      const color = new Color();
      Object.assign(color, {
        codigo: Number(codigo),
        descricao: descricao,
        hex: hex,
      });

      const colorExists = await this.prisma.cor.findUnique({
        where: {
          codigo: color.codigo,
        },
      });

      if (colorExists) {
        await this.update(colorExists.codigo, color);
      } else {
        await this.create(color);
      }
    }

    return;
  }
}
