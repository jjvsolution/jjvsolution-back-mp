import { TypeToken } from '@prisma/client';

export interface UserGoogleInterface {
  userId?: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  picture: string;
  token?: TokenInterface[];
}

export interface UserGithubInterface {
  userId?: string;
  username?: string;
  email?: string;
  fullName: string;
  picture: string;
  token?: TokenInterface[];
}

export interface TokenInterface {
  openId: string;
  type: TypeToken;
  accessToken: string;
  refreshToken: string;
}
