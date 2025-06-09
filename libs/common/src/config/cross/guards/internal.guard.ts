// custom-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ACUserRepository } from 'common/database/prisma';
import {
  PayloadJWTInterface,
  RequestWithUserInterface,
} from 'common/interfaces';
import { AuthService, TokenService } from 'common/services';
import { Request } from 'express';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private readonly aCUserRepository: ACUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUserInterface = context
      .switchToHttp()
      .getRequest<RequestWithUserInterface>();

    // Leer el token personalizado (ej. desde header)
    const token = TokenService.fromAuthHeaderAsBearerToken(request);
    const appId = TokenService.appId(request);
    if (!token) throw new UnauthorizedException('Missing token');

    // Lógica personalizada de validación
    const user: PayloadJWTInterface = await this.authService.verifyToken(
      appId,
      token,
    );

    // Adjuntar el usuario al request
    request.user = await this.getUser(user, token);
    return true;
  }
  async getUser(
    payload: PayloadJWTInterface,
    token: string,
  ): Promise<PayloadJWTInterface> {
    const user = await this.aCUserRepository.db.findUnique({
      where: {
        id: payload.uid,
        Token: {
          every: {
            token,
          },
        },
      },
      include: {
        Token: true,
      },
    });

    let dataFinal: PayloadJWTInterface;
    if (user && user?.Token && user.Token.length > 0) {
      dataFinal = { uid: user.id };
    } else {
      throw new UnauthorizedException();
    }
    return dataFinal;
  }
}
