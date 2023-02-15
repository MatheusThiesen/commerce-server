import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtSsoPayload } from 'src/modules/auth/types/jwtPayloadSso.type';

export const GetCurrentUserSso = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtSsoPayload => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as JwtSsoPayload;
    return user;
  },
);
