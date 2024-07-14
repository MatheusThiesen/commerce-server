import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

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
