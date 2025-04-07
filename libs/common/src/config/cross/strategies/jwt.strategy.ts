import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface, PayloadJWTInterface } from '@interfaces';
import { TokenRepository, UserRepository } from '@database/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService<ConfigurationsInterface>,
    /* private readonly userRepository: UserRepository,
    private tokenRepository: TokenRepository, */
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JSON.parse(config.get<string>('JWT_SECRET') || '').public_key,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadJWTInterface) {
    /* let token = '';
    try {
      token = req.headers['authorization'].split(' ')[1];
    } catch (error) {}
    const user = await this.userRepository.getUserInSession(payload.uid, token);

    let dataFinal = null;
    if (user && user?.Token && user.Token.length > 0) {
      const { Token, ...userData } = user;

      dataFinal = { ...userData, tokenAC: Token[0].tokenAC };
    }
    return dataFinal; */
    return payload;
  }
}
