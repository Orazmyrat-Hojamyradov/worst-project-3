
import { Request } from 'express';

export interface ReqWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
