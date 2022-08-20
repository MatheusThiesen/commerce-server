import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/parseCsv.utils';
import { CreateSubgroupDto } from './dto/create-subgroup.dto';
import { UpdateSubgroupDto } from './dto/update-subgroup.dto';
import { Subgroup } from './entities/subgroup.entity';

@Injectable()
export class SubgroupsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createSubgroupDto: CreateSubgroupDto) {
    const subGrupo = new Subgroup();

    Object.assign(subGrupo, createSubgroupDto);

    const SubgroupExists = await this.prisma.subGrupo.findUnique({
      where: {
        codigo: subGrupo.codigo,
      },
    });

    if (SubgroupExists) {
      throw new Error('SubGroup already exists');
    }

    const createdSubgroup = await this.prisma.subGrupo.create({
      data: subGrupo,
    });

    return createdSubgroup;
  }

  async findAll() {
    const subgroups = await this.prisma.subGrupo.findMany();
    return subgroups;
  }

  async findOne(codigo: number) {
    const subgroup = await this.prisma.subGrupo.findUnique({
      where: { codigo },
    });

    if (!subgroup) {
      throw new Error('SubGroup does not exist');
    }

    return;
  }

  async update(codigo: number, updateSubgroupDto: UpdateSubgroupDto) {
    const subGrupo = new Subgroup();

    Object.assign(subGrupo, updateSubgroupDto);

    await this.findOne(codigo);
    const updatedSubgroup = await this.prisma.subGrupo.update({
      data: subGrupo,
      where: { codigo },
    });

    return updatedSubgroup;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.subGrupo.delete({ where: { codigo } });

    return;
  }

  async import(file: Express.Multer.File) {
    const subgroups = await this.parseCsv.execute(file);

    for (const groupArr of subgroups) {
      const [codigo, descricao, situacao, codigoGrupo] = groupArr;

      const subGroup = new Subgroup();
      Object.assign(subGroup, {
        codigo: Number(codigo),
        descricao: descricao,
        codigoGrupo: Number(codigoGrupo),
        eAtivo: Number(situacao) === 1,
      });

      const subGroupExists = await this.prisma.subGrupo.findUnique({
        where: {
          codigo: subGroup.codigo,
        },
      });
      const groupExists = await this.prisma.grupo.findUnique({
        where: {
          codigo: subGroup.codigoGrupo,
        },
      });

      if (groupExists) {
        if (subGroupExists) {
          await this.update(subGroupExists.codigo, subGroup);
        } else {
          await this.create(subGroup);
        }
      }
    }

    return;
  }
}
