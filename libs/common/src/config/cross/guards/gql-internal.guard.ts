import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ACUserRepository } from 'common/database/prisma';
import { PayloadJWTInterface } from 'common/interfaces';
import { AuthService, TokenService } from 'common/services';

@Injectable()
export class GQLInternalGuard extends AuthGuard('local') {
  constructor(
    private authService: AuthService,
    private readonly aCUserRepository: ACUserRepository,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req: request } = ctx.getContext();

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

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
