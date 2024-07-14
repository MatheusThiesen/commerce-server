import { ParseCsv } from '@/utils/ParseCsv.utils';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';

@Injectable()
export class ConceptService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createConceptDto: CreateConceptDto) {
    const concept = new Concept();
    Object.assign(concept, createConceptDto);

    const exists = await this.prisma.conceito.findUnique({
      where: {
        codigo: concept.codigo,
      },
    });

    if (exists) {
      throw new Error('concept already exists');
    }

    const created = await this.prisma.conceito.create({
      data: concept,
    });

    return created;
  }

  async findOne(codigo: number) {
    const concept = await this.prisma.conceito.findUnique({
      where: {
        codigo,
      },
    });

    if (!concept) {
      throw new Error('concept does not exist');
    }

    return concept;
  }

  async update(codigo: number, updateConceptDto: UpdateConceptDto) {
    const concept = new Concept();
    Object.assign(concept, updateConceptDto);

    await this.findOne(codigo);

    const updated = await this.prisma.conceito.update({
      data: concept,

      where: { codigo },
    });

    return updated;
  }

  async import(file: Express.Multer.File) {
    const concepts = await this.parseCsv.execute(file);

    for (const conceptArr of concepts) {
      const [codigo, descricao, abreviacao, situacao] = conceptArr;

      const concept = new Concept();
      Object.assign(concept, {
        codigo: Number(codigo),
        descricao: descricao,
        abreviacao: abreviacao,
        eAtivo: Number(situacao) === 1,
      });

      const conceptExists = await this.prisma.conceito.findUnique({
        where: {
          codigo: concept.codigo,
        },
      });

      if (conceptExists) {
        await this.update(conceptExists.codigo, concept);
      } else {
        await this.create(concept);
      }
    }

    return;
  }
}
