import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtSsoPayload } from '../types/jwtPayloadSso.type';

@Injectable()
export class SsoStrategy extends PassportStrategy(Strategy, 'jwt-sso') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('SSO_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtSsoPayload) {
    const token = req?.get('authorization')?.replace('Bearer', '').trim();

    if (!token) throw new ForbiddenException('Refresh token malformed');

    return { ...payload, token: token };
  }
}
