import { Request } from 'express';

export interface PayloadJWTInterface {
  uid: string;
  applications: string[];
}

export interface RequestWithUserInterface extends Request {
  user: PayloadJWTInterface;
}
