import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import {
  ACApplicationsRepository,
  ACUserRepository,
} from 'common/database/prisma';
import { PayloadJWTInterface } from 'common/interfaces';
import { AuthService, TokenService } from 'common/services';

@Injectable()
export class GQLInternalGuard extends AuthGuard('local') {
  constructor(
    private authService: AuthService,
    private readonly aCUserRepository: ACUserRepository,
    private readonly aCApplicationsRepository: ACApplicationsRepository,
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
    request.user = await this.getUser(appId, user, token);
    return true;
  }
  async getUser(
    appId: string,
    payload: PayloadJWTInterface,
    token: string,
  ): Promise<PayloadJWTInterface> {
    const user = await this.aCUserRepository.db.findUnique({
      where: {
        id: payload.uid,
      },
      include: {
        Token: {
          where: {
            token,
          },
        },
        UserProfileApplications: {
          include: {
            Profiles: {
              include: {
                Applications: { select: { id: true } },
              },
            },
          },
        },
      },
    });
    const applications =
      user?.UserProfileApplications.flatMap((upa) => upa.Profiles)
        .flatMap((profile) => profile.Applications)
        .map((app) => app.id) || [];
    const profiles =
      user?.UserProfileApplications.flatMap((upa) => upa.Profiles).flatMap(
        (profile) => profile.name,
      ) || [];
    let dataFinal: PayloadJWTInterface;
    if (user && user?.Token && user.Token.length > 0) {
      const getUserIdIsAdmin = await this.getUserIdIsAdmin(
        appId,
        profiles,
        user.id,
      );
      dataFinal = { uid: user.id, applications, profiles, getUserIdIsAdmin };
    } else {
      throw new UnauthorizedException();
    }
    return dataFinal;
  }
  async getUserIdIsAdmin(appId: string, profiles: string[], userId: string) {
    const appName = await this.aCApplicationsRepository.db.findUnique({
      select: { name: true },
      where: { id: appId },
    });
    const getUserIdIsAdmin = profiles?.includes(
      `ADMIN_${appName?.name.toUpperCase().replaceAll(' ', '_')}`,
    )
      ? undefined
      : userId;
    return getUserIdIsAdmin;
  }
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
