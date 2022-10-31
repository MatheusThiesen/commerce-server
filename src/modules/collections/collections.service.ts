import { Injectable } from '@nestjs/common';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { PrismaService } from './../../database/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Collection } from './entities/collection.entity';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createCollectionDto: CreateCollectionDto) {
    const collection = new Collection();
    Object.assign(collection, createCollectionDto);

    const CollectionExists = await this.prisma.colecao.findUnique({
      where: {
        codigo: collection.codigo,
      },
    });

    if (CollectionExists) {
      throw new Error('Collection already exists');
    }

    const createdCollection = await this.prisma.colecao.create({
      data: collection,
    });

    return createdCollection;
  }

  async findAll() {
    const collections = await this.prisma.colecao.findMany();
    return collections;
  }

  async findOne(codigo: number) {
    const collection = await this.prisma.colecao.findUnique({
      where: { codigo },
    });

    if (!collection) {
      throw new Error('Collection does not exist');
    }

    return collection;
  }

  async update(codigo: number, updateCollectionDto: UpdateCollectionDto) {
    const collection = new Collection();

    Object.assign(collection, updateCollectionDto);

    await this.findOne(codigo);
    const updatedLine = await this.prisma.colecao.update({
      data: updateCollectionDto,
      where: { codigo },
    });

    return updatedLine;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.colecao.delete({ where: { codigo } });

    return;
  }

  async import(file: Express.Multer.File) {
    const collections = await this.parseCsv.execute(file);

    for (const collectionArr of collections) {
      const [codigo, descricao, situacao] = collectionArr;

      const collection = new Collection();
      Object.assign(collection, {
        codigo: Number(codigo),
        descricao: descricao,
        eAtivo: Number(situacao) === 1,
      });

      const collectionExists = await this.prisma.colecao.findUnique({
        where: {
          codigo: collection.codigo,
        },
      });

      if (collectionExists) {
        await this.update(collectionExists.codigo, collection);
      } else {
        await this.create(collection);
      }
    }

    return;
  }
}
