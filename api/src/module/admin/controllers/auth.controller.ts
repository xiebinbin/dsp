import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Wallet } from '../../../utils/wallet';
import aes from '../../../utils/aes';
import { LoginDto } from '../dto/auth.dto';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { CodeService } from '../services/code.service';
import { RedisCacheService } from '../../cache/services/redis-cache.service';
import { randomstr } from 'src/utils/randomstr';
import { PwdDto } from '../dto/pwd.dto';
@Controller('/api/admin/auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly codeService: CodeService,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  private readonly logger = new Logger(AuthController.name);
  @Post('login')
  @UseInterceptors(ApiResInterceptor)
  async login(@Body() data: LoginDto) {
    const priKey = this.config.get<string>('SYSTEM_PRI_KEY') ?? '';
    const wallet = new Wallet(priKey);
    const sharedSecret = wallet.getSharedSecret(wallet.getPubKey());

    try {
      //监测验证码
      const inputCode = data.inputCode;
      const codeid = data.codeid;
      const servCode = await this.redisCacheService.get(codeid);
      //获取缓存中的code
      const user = await this.authService.login(
        data.username,
        data.password,
        servCode,
        data.inputCode,
      );
      const res = {
        userId: Number(user.id),
        time: Date.now(),
      };
      return {
        token: aes.En(JSON.stringify(res), sharedSecret),
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
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
  @Get('getcode')
  @UseInterceptors(ApiResInterceptor)
  async getcode() {
    // __filename = '/Users/a/Documents/git/github/dsp-main/api/abc.png';
    // const bytes = Buffer.from(getcode.split(',')[1], 'base64');
    // const res = fs.writeFileSync(__filename, bytes);
    // this.logger.log('res', res);

    const randid = new randomstr();
    const codeid = randid.getrandid();
    const getcode = await this.codeService.GetCapta(codeid);
    return {
      url: getcode,
      codeid: codeid,
    };
  }
  @Post('changepwd')
  @UseInterceptors(ApiResInterceptor)
  async changepwd(@Body() data: PwdDto) {
    const username = data.username;
    const oldpwd = data.oldPassword;
    const newpwd = data.confirmPassword;
    try {
      const res = await this.authService.changepwd(username, oldpwd, newpwd);
      // console.log('res', res);
      return {
        res: res,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
}
