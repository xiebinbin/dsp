import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { AuthError } from 'src/utils/err_types';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(
    username: string,
    password: string,
    servCode: string,
    inputCode: string,
  ): Promise<User> {
    // if (servCode == null || servCode.toLowerCase() != inputCode.toLowerCase()) {
    //   // throw new Error('10001','验证码错误');
    //   throw AuthError.INVALID_CAPTCHA;
    // }
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }
    if (!user.enabled) {
      throw AuthError.USER_DISABLED;
    }
    if (await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw AuthError.WRONG_PASSWORD;
  }
  async changepwd(
    username: string,
    oldpwd: string,
    newpwd: string,
  ): Promise<boolean> {
    const user = await this.userService.findByUsername(username);
    console.log('compare res:', oldpwd, '----', user.password);
    if (!(await bcrypt.compare(oldpwd, user.password))) {
      throw AuthError.WRONG_PASSWORD;
    }
    await this.userService.updatePassword(user.id, newpwd);
    return true;
  }
}
