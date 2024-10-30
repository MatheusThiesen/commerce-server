import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use('/files', express.static(path.resolve(__dirname, '..', 'temp')));
  app.use(morgan('dev'));
  await app.listen(4444);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
