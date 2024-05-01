import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create(fileS3: Express.MulterS3.File) {
    const file = new File();
    Object.assign(file, {
      nome: fileS3.originalname,
      tamanho: fileS3.size,
      chave: fileS3.key,
      tipoArquivo: fileS3.mimetype,
      url: fileS3.location,
    });

    const created = await this.prisma.arquivo.create({
      data: file,
    });

    return created;
  }

  async createMany(files: Express.MulterS3.File[]) {
    const arrayFiles = files.map((fileS3) => {
      const file = new File();
      Object.assign(file, {
        nome: fileS3.originalname,
        tamanho: fileS3.size,
        chave: fileS3.key,
        tipoArquivo: fileS3.mimetype,
        url: fileS3.location,
      });

      return file;
    });

    const created = await this.prisma.arquivo.createMany({
      data: arrayFiles,
    });

    return created;
  }
}
