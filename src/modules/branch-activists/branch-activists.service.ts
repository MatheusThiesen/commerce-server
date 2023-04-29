import { Injectable } from '@nestjs/common';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { PrismaService } from '../../database/prisma.service';

import { CreateBranchActivityDto } from './dto/create-branch-activity.dto';
import { UpdateBranchActivityDto } from './dto/update-branch-activity.dto';
import { BranchActivity } from './entities/branch-activity.entity';

@Injectable()
export class BranchActivityService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createBranchActivityDto: CreateBranchActivityDto) {
    const branchActivity = new BranchActivity();
    Object.assign(branchActivity, createBranchActivityDto);

    const exists = await this.prisma.ramoAtividade.findUnique({
      where: {
        codigo: branchActivity.codigo,
      },
    });

    if (exists) {
      throw new Error('branchActivity already exists');
    }

    const created = await this.prisma.ramoAtividade.create({
      data: branchActivity,
    });

    return created;
  }

  async findOne(codigo: number) {
    const branchActivity = await this.prisma.ramoAtividade.findUnique({
      where: {
        codigo,
      },
    });

    if (!branchActivity) {
      throw new Error('branchActivity does not exist');
    }

    return branchActivity;
  }

  async update(
    codigo: number,
    updateBranchActivityDto: UpdateBranchActivityDto,
  ) {
    const branchActivity = new BranchActivity();
    Object.assign(branchActivity, updateBranchActivityDto);

    await this.findOne(codigo);

    const updated = await this.prisma.ramoAtividade.update({
      data: branchActivity,

      where: { codigo },
    });

    return updated;
  }

  async import(file: Express.Multer.File) {
    const branchActivists = await this.parseCsv.execute(file);

    for (const branchActivitArr of branchActivists) {
      const [codigo, descricao, abreviacao, situacao] = branchActivitArr;

      const branchActivity = new BranchActivity();
      Object.assign(branchActivity, {
        codigo: Number(codigo),
        descricao: descricao,
        abreviacao: abreviacao,
        eAtivo: Number(situacao) === 1,
      });

      const branchActivityExists = await this.prisma.ramoAtividade.findUnique({
        where: {
          codigo: branchActivity.codigo,
        },
      });

      if (branchActivityExists) {
        await this.update(branchActivityExists.codigo, branchActivity);
      } else {
        await this.create(branchActivity);
      }
    }

    return;
  }
}
