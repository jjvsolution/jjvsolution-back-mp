import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PPDebtLinkAuthBusiness } from '@business';
import { RequestWithPublicDebtLinkInterface } from '@interfaces';
import { TokenService } from 'common/services';
import { Request } from 'express';

@Injectable()
export class PublicDebtLinkGuard implements CanActivate {
  constructor(
    private readonly ppDebtLinkAuthBusiness: PPDebtLinkAuthBusiness,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & RequestWithPublicDebtLinkInterface>();

    const token = TokenService.fromAuthHeaderAsBearerToken(request);
    const appId = TokenService.appId(request);

    if (!token || !appId) {
      throw new UnauthorizedException('Missing token');
    }

    const payId = await this.ppDebtLinkAuthBusiness.verifyToken(appId, token);
    request.publicDebtLink = { payId };
    return true;
  }
}
