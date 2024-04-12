import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { sendMailConsumer } from '../../jobs/SendMail/sendMail-consumer';
import { sendMailProducerService } from '../../jobs/SendMail/sendMail-producer-service';
import { SellersModule } from '../app/sellers/sellers.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy, SsoStrategy } from './strategies';

@Module({
  imports: [
    forwardRef(() => SellersModule),
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
    SsoStrategy,
    sendMailProducerService,
    sendMailConsumer,
  ],
})
export class AuthModule {}
