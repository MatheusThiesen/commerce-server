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
      key: await readFile('./secrets/private-key.pem'),
      cert: await readFile('./secrets/public-certificate.pem'),
      rejectUnauthorized: false,
      requestCert: false,
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4444);
}
bootstrap();
