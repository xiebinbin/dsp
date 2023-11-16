import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { match } from 'assert';
import { Observable } from 'rxjs';

@Injectable()
export class GuardMiddlewareRoot implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你的用户信息存储在请求中的 user 属性中
    if (user.role === 'Root') {
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
export class GuardMiddlewareOperator implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你的用户信息存储在请求中的 user 属性中
    if (user.role === 'Operator') {
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

export const Roles = Reflector.createDecorator<string[]>();
const matchRoles = (roles, userRole) => {
  return roles.includes(userRole);
}
@Injectable()
export class RolesGuard implements CanActivate{
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return matchRoles(roles, request.user.role);
  }
}