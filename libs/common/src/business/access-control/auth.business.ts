import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ResponseClass } from 'common/config';
import { ACTokenRepository, ACUserRepository } from 'common/database/prisma';
import { AuthService } from 'common/services';

@Injectable()
export class AuthBusiness extends ResponseClass {
  constructor(
    private readonly authService: AuthService,
    private readonly aCUserRepository: ACUserRepository,
    private readonly aCTokenRepository: ACTokenRepository,
  ) {
    super();
  }
  async login(appId: string, username: string, password: string) {
    const user = await this.aCUserRepository.db.findFirst({
      select: {
        id: true,
        UserProfileApplications: {
          select: {
            Profiles: {
              select: {
                Applications: { select: { id: true } },
                RolsProfiles: {
                  include: {
                    Rols: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: {
        LoginType: { every: { type: 'local', username, password } },
        /* UserProfileApplications: {
          every: { Profiles: { Applications: { id: { in: [appId] } } } },
        }, */
      },
    });
    if (
      !user?.UserProfileApplications.find(
        (a) => a.Profiles.Applications.id === appId,
      )
    ) {
      this.unauthorized('USER_NOT_FOUND');
    }
    console.log(JSON.stringify(user));
    const rols = user?.UserProfileApplications.flatMap((upa) => upa.Profiles)
      .flatMap((profile) => profile.RolsProfiles)
      .map((rp) => rp.Rols.name);
    const applications = user?.UserProfileApplications.flatMap(
      (upa) => upa.Profiles,
    )
      .flatMap((profile) => profile.Applications)
      .map((app) => app.id);

    const payload = {
      uid: user?.id,
      rols,
      applications,
    };
    const token = await this.authService.signToken(appId, payload);
    console.log(token);
    await this.aCTokenRepository.db.create({
      data: {
        token,
        type: 'local',
        userId: user.id,
      },
    });
    return this.success(token);
  }
  async valid(appId: string, token: string) {
    const t = this.aCTokenRepository.db.findFirst({
      select: { id: true },
      where: { token },
    });
    if (!t) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return this.authService.verifyToken(appId, token);
  }
}
