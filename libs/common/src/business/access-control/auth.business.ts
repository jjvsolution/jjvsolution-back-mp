import { Injectable } from '@nestjs/common';
import { ACUserRepository } from 'common/database/prisma';
import { AuthService } from 'common/services';

@Injectable()
export class AuthBusiness {
  constructor(
    private readonly authService: AuthService,
    private readonly aCUserRepository: ACUserRepository,
  ) {}
  async login(appId: string, username: string, password: string) {
    const user = await this.aCUserRepository.db.findFirst({
      where: { LoginType: { every: { type: 'local', username, password } } },
    });
    const payload = {
      uid: user?.id,
    };
    return this.authService.signToken(appId, payload);
  }
  async valid(appId: string, token: string) {
    return this.authService.verifyToken(appId, token);
  }
}
