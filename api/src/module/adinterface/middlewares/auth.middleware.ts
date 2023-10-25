import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sysPriKey = this.config.get<string>('SYSTEM_PRI_KEY');
    if (!sysPriKey) {
      res.status(500).json({
        code: 500,
        message: '系统私钥未配置',
        data: null,
      });
      return;
    }
    console.log('req.path', req.path);

    next();
  }
}
