import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { sendMailConsumer } from 'src/jobs/SendMail/sendMail-consumer';
import { sendMailProducerService } from 'src/jobs/SendMail/sendMail-producer-service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.register({}),
    BullModule.registerQueue({
      name: 'sendMail-queue',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    sendMailProducerService,
    sendMailConsumer,
  ],
})
export class AuthModule {}
