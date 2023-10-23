import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Wallet } from '../../../utils/wallet';
import aes from '../../../utils/aes';
import { LoginDto } from '../dto/auth.dto';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { randomstr } from 'src/utils/randomstr';
import { CodeService } from '../services/code.service';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Controller('/api/advertiser/auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly AuthService: AuthService,
    private readonly CodeService: CodeService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @Post('login')
  @UseInterceptors(ApiResInterceptor)
  async login(@Body() data: LoginDto) {
    const priKey = this.config.get<string>('SYSTEM_PRI_KEY') ?? '';
    const wallet = new Wallet(priKey);
    const sharedSecret = wallet.getSharedSecret(wallet.getPubKey());
    try {
      // const inputCode = data.inputCode;
      // const codeid = data.codeid;
      // const servCode = await this.redisCacheService.get(codeid);
      //获取缓存中的code
      const advertiser = await this.AuthService.login(
        data.username,
        data.password,
        null,
        null,
      );
      const res = {
        advertiserId: Number(advertiser.id),
        time: Date.now(),
      };
      console.log('res token', aes.En(JSON.stringify(res), sharedSecret));
      return {
        token: aes.En(JSON.stringify(res), sharedSecret),
      };
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  @Post('info')
  @UseInterceptors(ApiResInterceptor)
  async info(@Req() req: Request) {
    try {
      console.log('req.advertiser', req.advertiser);
      const user = req.advertiser;
      return {
        username: user?.username,
        role: 'Advertiser',
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  @Get('getcode')
  @UseInterceptors(ApiResInterceptor)
  async getcode() {
    const randid = new randomstr();
    const codeid = randid.getrandid();
    const getcode = await this.CodeService.GetCapta(codeid);
    return {
      url: getcode,
      codeid: codeid,
    };
  }
}
