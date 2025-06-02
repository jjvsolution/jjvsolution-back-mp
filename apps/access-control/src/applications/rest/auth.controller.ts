import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthBusiness } from 'common/business/access-control';
import { ValidationPipe } from 'common/config';
import { CustomAuthGuard } from 'common/config/cross/guards/internal.guard';
import { LocalAuthDto } from 'common/dto';
import { RequestWithUserInterface } from 'common/interfaces';
import { AuthService, TokenService } from 'common/services';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authBusiness: AuthBusiness,
    private readonly tokenService: TokenService,
  ) {}

  @UseGuards(CustomAuthGuard)
  @Get('valid')
  async valid(@Req() request: RequestWithUserInterface) {
    return request.user;
  }

  @Post('login')
  async login(
    @Req() request: Request,
    @Body(new ValidationPipe()) signInDto: LocalAuthDto,
  ) {
    const appId = TokenService.appId(request);
    return this.authBusiness.login(
      appId!,
      signInDto.username,
      signInDto.password,
    );
  }
}
