import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class GuardMiddlewareAdv implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.advertiser; // 假设你的用户信息存储在请求中的 user 属性中
    // console.log('user guard', user);
    if (user) {
      return true; // 允许访问
    }

    return false; // 禁止访问
  }
}
