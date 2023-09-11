import { HttpException } from '@nestjs/common';

export class AuthError extends HttpException {
  static INVALID_CAPTCHA = new AuthError('验证码错误', 10001);

  static USER_NOT_FOUND = new AuthError('用户不存在', 10002);

  static USER_DISABLED = new AuthError('用户被禁用', 10003);

  static WRONG_PASSWORD = new AuthError('密码错误', 10004);
  static USER_IS_EXSIT = new AuthError('用户已存在', 10005);
  static USERNAME_IS_SAME = new AuthError('用户名已存在相同，请修改', 10005);

  constructor(public message: string, public code: number) {
    super(message, code);
  }
}
