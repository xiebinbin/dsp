import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Wallet } from '../../../utils/wallet';
import aes from '../../../utils/aes';
import { LoginDto } from '../dto/auth.dto';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';

@Controller('/api/admin/auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @UseInterceptors(ApiResInterceptor)
  async login(@Body() data: LoginDto) {
    const priKey = this.config.get<string>('SYSTEM_PRI_KEY') ?? '';
    const wallet = new Wallet(priKey);
    const sharedSecret = wallet.getSharedSecret(wallet.getPubKey());
    try {
      const user = await this.authService.login(data.username, data.password);
      const res = {
        userId: Number(user.id),
        time: Date.now(),
      };
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
    const user = req.user;
    return {
      role: user?.role,
      username: user?.username,
    };
  }
}
