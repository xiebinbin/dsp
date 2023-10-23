import { Injectable } from '@nestjs/common';
import { Advertiser } from '@prisma/client';
import { AdvertiserService } from './advertiser.service';
import * as bcrypt from 'bcrypt';
import { AuthError } from 'src/utils/err_types';

@Injectable()
export class AuthService {
  constructor(private readonly AdvertiserService: AdvertiserService) {}

  async login(
    username: string,
    password: string,
    servCode: string,
    inputCode: string,
  ): Promise<Advertiser> {
    // if (servCode == null || servCode.toLowerCase() != inputCode.toLowerCase()) {
    //   // throw new Error('10001','验证码错误');
    //   throw AuthError.INVALID_CAPTCHA;
    // }
    const advertiser = await this.AdvertiserService.findByUsername(username);
    if (!advertiser) {
      throw AuthError.ADV_NOT_FOUND;
    }
    if (!advertiser.enabled) {
      throw AuthError.ADV_DISABLED;
    }
    if (await bcrypt.compare(password, advertiser.password)) {
      return advertiser;
    }
    throw AuthError.WRONG_PASSWORD;
  }
}
