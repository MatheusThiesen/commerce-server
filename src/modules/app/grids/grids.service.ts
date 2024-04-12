import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ParseCsv } from '../../../utils/ParseCsv.utils';
import { CreateGridDto } from './dto/create-grid.dto';
import { UpdateGridDto } from './dto/update-grid.dto';
import { Grid } from './entities/grid.entity';

@Injectable()
export class GridsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createGridDto: CreateGridDto) {
    const grid = new Grid();
    Object.assign(grid, createGridDto);

    const exists = await this.prisma.grade.findUnique({
      where: {
        codigo: grid.codigo,
      },
    });

    if (exists) {
      throw new Error('Grid already exists');
    }

    const created = await this.prisma.grade.create({
      data: {
        ...grid,
        tamanhos: {
          connectOrCreate: grid.tamanhos.map((size) => ({
            create: { descricao: String(size) },
            where: { descricao: String(size) },
          })),
        },
      },
    });

    return created;
  }

  async findOne(codigo: number) {
    const grid = await this.prisma.grade.findUnique({
      where: {
        codigo,
      },
    });

    if (!grid) {
      throw new Error('Grid does not exist');
    }

    return grid;
  }

  async update(codigo: number, updateGridDto: UpdateGridDto) {
    const grid = new Grid();
    Object.assign(grid, updateGridDto);

    await this.findOne(codigo);

    const updated = await this.prisma.grade.update({
      data: {
        ...grid,
        tamanhos: {
          connectOrCreate: grid.tamanhos.map((size) => ({
            create: { descricao: String(size) },
            where: { descricao: String(size) },
          })),
        },
      },
      where: { codigo },
    });

    return updated;
  }

  async import(file: Express.Multer.File) {
    const grids = await this.parseCsv.execute(file);

    for (const gridArr of grids) {
      const [codigo, descricao, abreviacao, situacao, tamanhos] = gridArr;

      const group = new Grid();
      Object.assign(group, {
        codigo: Number(codigo),
        descricao: descricao,
        abreviacao: abreviacao,
        eAtivo: Number(situacao) === 1,
        tamanhos: tamanhos.split('|'),
      });

      const groupExists = await this.prisma.grupo.findUnique({
        where: {
          codigo: group.codigo,
        },
      });

      if (groupExists) {
        await this.update(groupExists.codigo, group);
      } else {
        await this.create(group);
      }
    }

    return;
  }
}
