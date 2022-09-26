import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../database/prisma.service';
import { ParseCsv } from './../../utils/parseCsv.utils';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { Line } from './entities/line.entity';

@Injectable()
export class LinesService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createLineDto: CreateLineDto) {
    const line = new Line();
    Object.assign(line, createLineDto);

    console.log(line);

    const LineExists = await this.prisma.linha.findUnique({
      where: {
        codigo: line.codigo,
      },
    });

    if (LineExists) {
      throw new Error('Line already exists');
    }

    const createdLine = await this.prisma.linha.create({
      data: line,
    });

    return createdLine;
  }

  async findAll() {
    const lines = await this.prisma.linha.findMany();
    return lines;
  }

  async findOne(codigo: number) {
    const line = await this.prisma.linha.findUnique({
      where: { codigo },
    });

    if (!line) {
      throw new Error('Line does not exist');
    }

    return line;
  }

  async update(codigo: number, updateLineDto: UpdateLineDto) {
    const line = new Line();

    Object.assign(line, updateLineDto);

    await this.findOne(codigo);
    const updatedLine = await this.prisma.linha.update({
      data: line,
      where: { codigo },
    });

    return updatedLine;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.linha.delete({ where: { codigo } });

    return;
  }

  async import(file: Express.Multer.File) {
    const linhas = await this.parseCsv.execute(file);

    for (const linhaArr of linhas) {
      const [codigo, descricao, situacao] = linhaArr;

      const line = new Line();
      Object.assign(line, {
        codigo: Number(codigo),
        descricao: descricao,
        eAtivo: Number(situacao) === 1,
      });

      const subGroupExists = await this.prisma.subGrupo.findUnique({
        where: {
          codigo: line.codigo,
        },
      });

      if (subGroupExists) {
        await this.update(subGroupExists.codigo, line);
      } else {
        await this.create(line);
      }
    }

    return;
  }
}
