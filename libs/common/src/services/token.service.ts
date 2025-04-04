import {
  X_REQUEST_ID,
  X_AMAZON_API_GATEWAY_API_ID,
  X_AMAZON_API_GATEWAY_STAGE,
} from '@shared/log4js';

export enum TOKEN_CONFIG {
  AUTH_HEADER = 'authorization',
  LEGACY_AUTH_SCHEME = 'JWT',
  BEARER_AUTH_SCHEME = 'bearer',
}
export class TokenService {
  public static fromAuthHeaderAsBearerToken(req) {
    let token = null;
    if (req && req.headers && req.headers[TOKEN_CONFIG.AUTH_HEADER]) {
      const auth = req.headers[TOKEN_CONFIG.AUTH_HEADER];
      const tokenArray = auth.split(' ');
      token = tokenArray.length > 1 ? tokenArray[1] : '';
    }
    return token;
  }

  public static getTokenHeaderAC(token: string, headers: object) {
    const headersRequest = {
      'Content-Type': 'application/json',
      X_REQUEST_ID: headers[X_REQUEST_ID],
      X_AMAZON_API_GATEWAY_API_ID: headers[X_AMAZON_API_GATEWAY_API_ID],
      X_AMAZON_API_GATEWAY_STAGE: headers[X_AMAZON_API_GATEWAY_STAGE],
      [TOKEN_CONFIG.AUTH_HEADER]: `${TOKEN_CONFIG.BEARER_AUTH_SCHEME} ${token}`,
    };

    return { headers: headersRequest };
  }
}
