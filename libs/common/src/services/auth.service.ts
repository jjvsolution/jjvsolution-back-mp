import { ConfigurationsInterface } from '@interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<ConfigurationsInterface>,
  ) {}

  async signToken(payload: object): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      algorithm: 'ES384',
      privateKey: (
        JSON.parse(this.config.get<string>('JWT_SECRET') || '') as {
          private_key: string;
        }
      ).private_key,
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
    });
  }

  async verifyToken(token: string): Promise<object> {
    return await this.jwtService.verify(token);
  }
}
