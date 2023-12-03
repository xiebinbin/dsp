import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { UserService } from '../services/user.service';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';
import { GuardMiddlewareOperator } from '../middlewares/guard.middleware';

@Controller('/api/admin/users')
export class UserController {
  constructor(private readonly UserService: UserService) { }
  @Get('agentslist')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareOperator) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getAgent() {
    return await this.UserService.findAgents();
  }

  @Get('optlist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getOptList() {
    return await this.UserService.findOperators();
  }
  @Post('list')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async getList(@Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    return await this.UserService.getList({
      page,
      limit,
      orderBy,
      username: queryParams.q || '',
      role: queryParams.extra.role,
    });
  }
  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async getUser(@Param('id') id: number) {

    const userinfo = await this.UserService.findById(BigInt(id));
    return this.convertUserInfo(userinfo);
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateUser(
    @Param('id') id: bigint,
    @Body()
    userDto: UserDto,
  ) {
    return await this.UserService.updateUser(id, userDto);
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Req() req: Request, @Body() data: UserDto) {

    const userinfo = await this.UserService.findById(BigInt(req.user.id));
    if (userinfo.role != 'Root') {
      throw new HttpException(
        AuthError.USER_NOT_Permission.message,
        AuthError.USER_NOT_Permission.code,
      );
    }
    const username = await this.UserService.findByUsername(data.username);
    console.log('data,username', username);

    if (username) {
      throw new HttpException(
        AuthError.USERNAME_IS_SAME.message,
        AuthError.USERNAME_IS_SAME.code,
      );
    }
    const res = await this.UserService.createUser(data);
    if (res.id) {
      const userDto: UserDto = {
        id: res.id,
        nickname: res.nickname,
        taxnumber: res.taxnumber,
        username: res.username,
        password: res.password,
        role: res.role,
        updatedAt: null, // 注意处理日期格式
        enabled: res.enabled,
      };
      return this.convertUserInfo(userDto);
    }
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async removeUser(
    @Req() req: Request,
    @Param('id') id: bigint,
  ) {
    const userinfo = await this.UserService.findById(BigInt(req.user.id));
    if (userinfo.role != 'Root') {
      throw new HttpException(
        AuthError.USER_NOT_Permission.message,
        AuthError.USER_NOT_Permission.code,
      );
    }
    return await this.UserService.removeUser(id);
  }
  convertUserInfo(user: any): any {
    // Make a shallow copy of the user object
    const newUser = { ...user };

    // Convert the 'id' property to BigInt
    newUser.id = Number(user.id);
    newUser.password = '';
    return newUser;
  }
}
