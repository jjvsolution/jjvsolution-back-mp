import { PayloadJWTInterface } from '@interfaces';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACApplicationsRepository } from 'common/database/prisma';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly applicationRepositor: ACApplicationsRepository,
  ) {}

  async signToken(appId: string, payload: object): Promise<string | never> {
    const jwtConfig = await this.applicationRepositor.db.findUnique({
      select: {
        ConfigAuthApplication: {
          select: {
            jwt: true,
          },
        },
      },
      where: { id: appId },
    });
    if (!jwtConfig) {
      throw new Error('AUTH_ERROR');
    }
    const jwt = jwtConfig.ConfigAuthApplication?.jwt as {
      PRIVATE_KEY: string;
      PUBLIC_KEY: string;
      JWT_EXPIRES_IN: StringValue | number | undefined;
    };
    return await this.jwtService.signAsync(payload, {
      algorithm: 'ES384',
      privateKey: jwt.PRIVATE_KEY,
      expiresIn: jwt.JWT_EXPIRES_IN,
    });
  }

  async verifyToken(
    appId: string,
    token: string,
  ): Promise<PayloadJWTInterface> {
    try {
      const jwtConfig = await this.applicationRepositor.db.findUnique({
        select: {
          ConfigAuthApplication: {
            select: {
              jwt: true,
            },
          },
        },
        where: { id: appId },
      });
      if (!jwtConfig) {
        throw new Error('AUTH_ERROR');
      }
      const jwt = jwtConfig.ConfigAuthApplication?.jwt as {
        PRIVATE_KEY: string;
        PUBLIC_KEY: string;
        JWT_EXPIRES_IN: string;
      };
      const payload: PayloadJWTInterface =
        this.jwtService.verify<PayloadJWTInterface>(token, {
          algorithms: ['ES384'],
          publicKey: jwt.PUBLIC_KEY,
        });
      return payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
