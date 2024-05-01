import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PanelStatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const states = await this.prisma.estado.findMany({
      select: {
        uf: true,
        nome: true,
      },
      orderBy: {
        uf: 'asc',
      },
    });

    return {
      data: states,
      total: states.length,
    };
  }
}
