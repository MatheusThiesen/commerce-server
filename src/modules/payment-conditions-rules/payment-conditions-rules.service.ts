import { Injectable } from '@nestjs/common';
import { CreatePaymentConditionsRuleDto } from './dto/create-payment-conditions-rule.dto';
import { UpdatePaymentConditionsRuleDto } from './dto/update-payment-conditions-rule.dto';

import { PrismaService } from '../../database/prisma.service';
import { PaymentConditionsRule } from './entities/payment-conditions-rule.entity';

import { ParseCsv } from '../../utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from '../../utils/StringToNumberOrUndefined.utils';

@Injectable()
export class PaymentConditionsRulesService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private readonly stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  async create(createRuleDto: UpdatePaymentConditionsRuleDto) {
    const rule = new PaymentConditionsRule();
    Object.assign(rule, createRuleDto);

    const exists = await this.prisma.regraCondicaoPagamento.findUnique({
      where: {
        listaPrecoCodigo_condicaoPagamentoCodigo_marcaCodigo: {
          marcaCodigo: rule.marcaCodigo,
          listaPrecoCodigo: rule.listaPrecoCodigo,
          condicaoPagamentoCodigo: rule.condicaoPagamentoCodigo,
        },
      },
    });

    if (exists) {
      throw new Error('concept already exists');
    }

    const created = await this.prisma.regraCondicaoPagamento.create({
      data: rule,
    });

    return created;
  }

  async update(id: string, updateRuleDto: CreatePaymentConditionsRuleDto) {
    const rule = new PaymentConditionsRule();
    Object.assign(rule, updateRuleDto);

    await this.findOne(id);

    const updated = await this.prisma.regraCondicaoPagamento.update({
      data: rule,

      where: { id },
    });

    return updated;
  }

  async findOne(id: string) {
    const rule = await this.prisma.regraCondicaoPagamento.findUnique({
      where: {
        id,
      },
    });

    if (!rule) {
      throw new Error('Rule does not exist');
    }

    return rule;
  }

  async import(file: Express.Multer.File) {
    const rules = await this.parseCsv.execute(file);

    for (const ruleArr of rules) {
      const [
        concicaoPagamentoCod,
        marcaCod,
        listaPrecoCod,
        LocalCobrancaCod,
        valorMinimo,
        ativo,
      ] = ruleArr;

      const rule = new PaymentConditionsRule();
      Object.assign(rule, {
        condicaoPagamentoCodigo:
          this.stringToNumberOrUndefined.execute(concicaoPagamentoCod),
        marcaCodigo: this.stringToNumberOrUndefined.execute(marcaCod),
        listaPrecoCodigo: this.stringToNumberOrUndefined.execute(listaPrecoCod),
        localCobrancaCodigo:
          this.stringToNumberOrUndefined.execute(LocalCobrancaCod),
        valorMinimo: this.stringToNumberOrUndefined.execute(valorMinimo),
        eAtivo: String(ativo)?.toLocaleLowerCase() === 'sim',
      });

      const ruleExists = await this.prisma.regraCondicaoPagamento.findUnique({
        where: {
          listaPrecoCodigo_condicaoPagamentoCodigo_marcaCodigo: {
            marcaCodigo: rule.marcaCodigo,
            listaPrecoCodigo: rule.listaPrecoCodigo,
            condicaoPagamentoCodigo: rule.condicaoPagamentoCodigo,
          },
        },
      });

      try {
        if (ruleExists) {
          await this.update(ruleExists.id, rule);
        } else {
          await this.create(rule);
        }
      } catch (error) {
        console.log(rule);
        console.log(error);
      }
    }

    return;
  }
}
