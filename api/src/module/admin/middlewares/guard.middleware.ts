import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class GuardMiddlewareRoot implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你的用户信息存储在请求中的 user 属性中
    if (user.role === 'Root' || user.role === 'Operator') {
      return true; // 允许访问
    }

    return false; // 禁止访问
  }
}
@Injectable()
export class GuardMiddlewareAgent implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你的用户信息存储在请求中的 user 属性中
    console.log('user guard', user);
    if (user.role === 'Agent') {
      return true; // 允许访问
    }

    return false; // 禁止访问
  }
}
@Injectable()
export class GuardMiddlewareAll implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你的用户信息存储在请求中的 user 属性中
    if (
      user.role === 'Root' ||
      user.role === 'Operator' ||
      user.role === 'Agent'
    ) {
      return true; // 允许访问
    }

    return false; // 禁止访问
  }
}
