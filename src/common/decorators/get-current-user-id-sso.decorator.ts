import { JwtSsoPayload } from '@/modules/auth/types/jwtPayloadSso.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserSso = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtSsoPayload => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as JwtSsoPayload;
    return user;
  },
);
