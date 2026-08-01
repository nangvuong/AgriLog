import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IUserTokenPayload } from 'agrilog-shared';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.body) {
            token = request.body.refresh_token;
          }
          if (!token && request && request.headers.authorization) {
            const bearer = request.headers.authorization.split(' ');
            if (bearer.length === 2 && bearer[0] === 'Bearer') {
              token = bearer[1];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'agrilog_refresh_secret_key_development_only',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IUserTokenPayload) {
    const refreshToken = req.body?.refresh_token || req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from request');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
