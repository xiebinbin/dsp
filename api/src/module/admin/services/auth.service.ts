import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }
    if (!user.enabled) {
      throw new Error('用户已禁用');
    }
    if (await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new Error('密码错误');
  }
}
