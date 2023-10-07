import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Wallet } from '../../../utils/wallet';
import aes from '../../../utils/aes';
import { AdvertiserService } from '../services/advertiser.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private readonly AdvertiserService: AdvertiserService,
  ) {}

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
    const authorization = req.header('Authorization') as
      | string
      | undefined
      | null;
    if (
      !authorization &&
      req.path != '/api/advertiser/auth/login' &&
      req.path != '/api/advertiser/auth/getcode'
    ) {
      res.status(400).json({
        code: 400,
        message: '请先登录',
        data: null,
      });
      return;
    }
    if (authorization) {
      const token = authorization.substring(7);
      const priKey = this.config.get<string>('SYSTEM_PRI_KEY') ?? '';
      const wallet = new Wallet(priKey);
      const sharedSecret = wallet.getSharedSecret(wallet.getPubKey());
      const loginData: {
        advertiserId: number;
        time: number;
      } = JSON.parse(aes.De(token, sharedSecret));
      if (Date.now() - loginData.time > 24 * 60 * 60000) {
        res.status(400).json({
          code: 400,
          message: '登录信息已过期',
          data: null,
        });
        return;
      }
      const advertiser = await this.AdvertiserService.findById(
        BigInt(loginData.advertiserId),
      );
      if (!advertiser) {
        res.status(400).json({
          code: 400,
          message: '登录信息错误',
          data: null,
        });
        return;
      }
      req.advertiser = advertiser;
    }
    next();
  }
}
