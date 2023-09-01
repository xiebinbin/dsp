import { Advertiser, User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      advertiser?: Advertiser;
    }
  }
}
