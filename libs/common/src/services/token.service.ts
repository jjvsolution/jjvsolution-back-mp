import {
  X_REQUEST_ID,
  X_AMAZON_API_GATEWAY_API_ID,
  X_AMAZON_API_GATEWAY_STAGE,
} from '@shared/log4js';

export enum TOKEN_CONFIG {
  AUTH_HEADER = 'authorization',
  X_APP_ID = 'x-app-id',
  LEGACY_AUTH_SCHEME = 'JWT',
  BEARER_AUTH_SCHEME = 'bearer',
}
export class TokenService {
  public static fromAuthHeaderAsBearerToken(req) {
    let token = '';
    if (req && req.headers && req.headers[TOKEN_CONFIG.AUTH_HEADER]) {
      const auth = req.headers[TOKEN_CONFIG.AUTH_HEADER];
      const tokenArray = auth.split(' ');
      token = tokenArray.length > 1 ? tokenArray[1] : '';
    }
    return token;
  }

  public static appId(req): string {
    let appId = '';
    if (req && req.headers && req.headers[TOKEN_CONFIG.X_APP_ID]) {
      appId = req.headers[TOKEN_CONFIG.X_APP_ID];
    }
    return appId;
  }

  public static getTokenHeaderAC(token: string, headers: object) {
    const headersRequest = {
      'Content-Type': 'application/json',
      X_REQUEST_ID: headers[X_REQUEST_ID],
      [TOKEN_CONFIG.AUTH_HEADER]: `${TOKEN_CONFIG.BEARER_AUTH_SCHEME} ${token}`,
    };

    return { headers: headersRequest };
  }
}
