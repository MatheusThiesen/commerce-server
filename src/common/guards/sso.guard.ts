import { AuthGuard } from '@nestjs/passport';

export class SsoGuard extends AuthGuard('jwt-sso') {
  constructor() {
    super();
  }
}
