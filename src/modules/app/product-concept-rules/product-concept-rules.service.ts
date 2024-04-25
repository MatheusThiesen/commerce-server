import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ParseCsv } from '../../../utils/ParseCsv.utils';
import { CreateProductConceptRuleDto } from './dto/create-product-concept-rule.dto';
import { UpdateProductConceptRuleDto } from './dto/update-product-concept-rule.dto';
import { ProductConceptRule } from './entities/product-concept-rule.entity';

@Injectable()
export class ProductConceptRulesService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createRuleDto: CreateProductConceptRuleDto) {
    const rule = new ProductConceptRule();
    Object.assign(rule, createRuleDto);

    const subgrupoExists = await this.prisma.subGrupo.findUnique({
      select: {
        id: true,
      },
      where: {
        codigo_codigoGrupo: {
          codigo: rule.subgroupCod,
          codigoGrupo: rule.groupCod,
        },
      },
    });

    if (!subgrupoExists) throw Error('Not Exists Subgroup');

    const exists = await this.prisma.regraProdutoConceito.findUnique({
      where: {
        subGrupoId_conceitoCodigo: {
          subGrupoId: subgrupoExists.id,
          conceitoCodigo: rule.conceitoCodigo,
        },
      },
    });

    if (exists) {
      throw new Error('concept already exists');
    }

    const created = await this.prisma.regraProdutoConceito.create({
      data: {
        conceitoCodigo: rule.conceitoCodigo,
        subGrupoId: subgrupoExists.id,
      },
    });

    return created;
  }

  async findOne(id: string) {
    const rule = await this.prisma.regraProdutoConceito.findUnique({
      where: {
        id,
      },
    });

    if (!rule) {
      throw new Error('Rule does not exist');
    }

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateProductConceptRuleDto) {
    const rule = new ProductConceptRule();
    Object.assign(rule, updateRuleDto);

    await this.findOne(id);

    const subgrupoExists = await this.prisma.subGrupo.findUnique({
      select: {
        id: true,
      },
      where: {
        codigo_codigoGrupo: {
          codigo: rule.subgroupCod,
          codigoGrupo: rule.groupCod,
        },
      },
    });

    if (!subgrupoExists) throw Error('Not Exists Subgroup');

    const updated = await this.prisma.regraProdutoConceito.update({
      data: {
        conceitoCodigo: rule.conceitoCodigo,
        subGrupoId: subgrupoExists.id,
      },

      where: { id },
    });

    return updated;
  }

  async import(file: Express.Multer.File) {
    const rules = await this.parseCsv.execute(file);

    await this.prisma.regraProdutoConceito.deleteMany({});

    for (const ruleArr of rules) {
      const [conceitoCod, grupoCod, subgrupoCod] = ruleArr;

      const rule = new ProductConceptRule();
      Object.assign(rule, {
        groupCod: Number(grupoCod),
        subgroupCod: Number(subgrupoCod),
        conceitoCodigo: Number(conceitoCod),
      });

      const subgrupoExists = await this.prisma.subGrupo.findUnique({
        select: {
          id: true,
        },
        where: {
          codigo_codigoGrupo: {
            codigo: rule.subgroupCod,
            codigoGrupo: rule.groupCod,
          },
        },
      });

      if (subgrupoExists) {
        const conceptExists = await this.prisma.regraProdutoConceito.findUnique(
          {
            where: {
              subGrupoId_conceitoCodigo: {
                subGrupoId: subgrupoExists.id,
                conceitoCodigo: rule.conceitoCodigo,
              },
            },
          },
        );

        if (conceptExists) {
          await this.update(conceptExists.id, rule);
        } else {
          await this.create(rule);
        }
      }
    }

    return;
  }
}
