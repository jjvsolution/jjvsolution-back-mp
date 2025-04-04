import { TypeToken } from '@prisma/client';

export interface UserGeneric {
  email?: string;
  username: string;
  password?: string;
  openId?: string;
  type: TypeToken;
  accessToken?: string;
  refreshToken?: string;
}
