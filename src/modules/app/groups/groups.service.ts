import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ParseCsv } from '../../../utils/ParseCsv.utils';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = new Group();
    Object.assign(group, createGroupDto);

    const groupExists = await this.prisma.grupo.findUnique({
      where: {
        codigo: group.codigo,
      },
    });

    if (groupExists) {
      throw new Error('Group already exists');
    }

    const createdGroup = await this.prisma.grupo.create({
      data: group,
    });

    return createdGroup;
  }

  async findAll() {
    const groups = await this.prisma.grupo.findMany();
    return groups;
  }

  async findOne(codigo: number) {
    const group = await this.prisma.grupo.findUnique({
      where: {
        codigo,
      },
    });

    if (!group) {
      throw new Error('Group does not exist');
    }

    return group;
  }

  async update(codigo: number, updateGroupDto: UpdateGroupDto) {
    const group = new Group();
    Object.assign(group, updateGroupDto);

    await this.findOne(codigo);

    const updatedGroup = await this.prisma.grupo.update({
      data: group,
      where: { codigo },
    });

    return updatedGroup;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.grupo.delete({ where: { codigo } });
    return;
  }

  async import(file: Express.Multer.File) {
    const groups = await this.parseCsv.execute(file);

    for (const groupArr of groups) {
      const [codigo, descricao, situacao] = groupArr;

      const group = new Group();
      Object.assign(group, {
        codigo: Number(codigo),
        descricao: descricao,
        eAtivo: Number(situacao) === 1,
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
