import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const responde = context.switchToHttp().getResponse();

    responde.setTimeout(600000);

    return next.handle();
  }
}
