import { Request } from 'express';

export interface PayloadJWTInterface {
  uid: string;
  applications: string[];
  profiles?: string[];
  getUserIdIsAdmin?: string;
}

export interface RequestWithUserInterface extends Request {
  user: PayloadJWTInterface;
}
