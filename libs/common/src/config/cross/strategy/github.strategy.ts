import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface, UserGithubInterface } from '@interfaces';
import { TypeToken } from '@prisma/client';
config();

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly config: ConfigService<ConfigurationsInterface>) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get('GITHUB_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, username, emails, displayName, photos } = profile;

    const user: UserGithubInterface = {
      username,
      email:
        Array.isArray(emails) && emails.length > 0 ? emails[0].value : null,
      fullName: displayName,
      picture:
        Array.isArray(photos) && photos.length > 0 ? photos[0].value : null,
      token: [
        {
          openId: id,
          accessToken,
          refreshToken,
          type: TypeToken.github,
        },
      ],
    };

    done(null, user);
  }
}
