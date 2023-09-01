import { Injectable } from '@nestjs/common';
import { Advertiser } from '@prisma/client';
import { AdvertiserService } from './advertiser.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly advertiserService: AdvertiserService) {}

  async login(username: string, password: string): Promise<Advertiser> {
    const advertiser = await this.advertiserService.findByUsername(username);
    if (!advertiser) {
      throw new Error('广告主不存在');
    }
    if (!advertiser.enabled) {
      throw new Error('广告主已禁用');
    }
    if (await bcrypt.compare(password, advertiser.password)) {
      return advertiser;
    }
    throw new Error('密码错误');
  }
}
