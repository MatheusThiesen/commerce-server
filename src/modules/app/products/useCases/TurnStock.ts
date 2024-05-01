import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TurnStock {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 3 */1 * *', {
    timeZone: 'America/Sao_Paulo',
  })
  async execute() {
    await this.prisma.$executeRawUnsafe(
      `
        update "locaisEstoque" set "eAtivo" = false
        where id in (
          select le.id  from "locaisEstoque" le 
          where   le.periodo <> 'pronta-entrega' and 
                  le."eAtivo" = true and
                  le."data" < CAST(concat(TO_CHAR(CURRENT_DATE , 'yyyy-MM'), '-01')  AS DATE))
    `,
    );
  }
}
