import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { readFile } from 'fs/promises';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
    httpsOptions: {
      key: await readFile('./secrets/private-key.pem', 'utf8'),
      cert: await readFile('./secrets/public-certificate.pem', 'utf8'),
      // rejectUnauthorized: false,
      // requestCert: false,
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4444);
}
bootstrap();
