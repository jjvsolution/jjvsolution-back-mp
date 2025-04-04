import { Request } from 'express';

export interface PayloadJWTInterface {
  sub: string;
}

export interface RequestWithUserInterface extends Request {
  user: PayloadJWTInterface;
}
