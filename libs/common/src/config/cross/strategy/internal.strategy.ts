import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from '@interfaces';

@Injectable()
export class InternalStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<ConfigurationsInterface>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JSON.parse(config.get<string>('JWT_SECRET') || '').public_key,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
