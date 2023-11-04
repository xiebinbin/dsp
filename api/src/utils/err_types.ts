import { HttpException } from '@nestjs/common';

export class AuthError extends HttpException {
  static INVALID_CAPTCHA = new AuthError('验证码错误', 10001);

  static USER_NOT_FOUND = new AuthError('用户不存在', 10002);

  static USER_DISABLED = new AuthError('用户被禁用', 10003);

  static WRONG_PASSWORD = new AuthError('密码错误', 10004);
  static USER_IS_EXSIT = new AuthError('用户已存在', 10005);
  static USERNAME_IS_SAME = new AuthError('用户名存在相同，请修改', 10005);
  static MaterialName_IS_SAME = new AuthError('创意名已存在，请修改', 10006);

  static MEDIA_NOT_FOUND = new AuthError('媒体不存在', 10008);
  static MediaName_IS_SAME = new AuthError('媒体名已存在，请修改', 10009);
  static PLACEMENTNAME_IS_SAME = new AuthError('计划名已存在，请修改', 10010);
  static BALANCE_NOTENOUGH = new AuthError('该广告主余额不足,请充值', 10011);
  static USER_NOT_Permission = new AuthError('用户无权限', 10012);

  static ADV_NOT_FOUND = new AuthError('广告主不存在', 20001);
  static ADV_DISABLED = new AuthError('广告主被禁用', 20002);
  static ADV_IS_EXSIT = new AuthError('广告主已存在', 20003);
  static PLACEMENT_NOT_FOUND = new AuthError('广告计划不存在', 20004);
  static PLACEMENT_NOT_ENOUGH = new AuthError('广告计划余额不足', 20005);
  static Material_NOT_FOUND = new AuthError('广告创意不存在', 20004);

  constructor(public message: string, public code: number) {
    super(message, code);
  }
  // constructor(message: string, code: number) {
  //   super(
  //     {
  //       data: null,
  //       code,
  //       message,
  //     },
  //     HttpStatus.FORBIDDEN, // 此处可以根据需要设置不同的状态码
  //   );
  // }
}
