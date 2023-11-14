import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
  Res,
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

@Controller('/api/admin/users')
export class UserController {
  constructor(private readonly UserService: UserService) {}
  private readonly logger = new Logger(UserController.name);
  // restrictedRoute() {
  //   throw new HttpException(
  //     AuthError.USERNAME_IS_SAME.message,
  //     AuthError.USERNAME_IS_SAME.code,
  //   );
  // }
  @Get('agentslist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getAgent() {
    try {
      const agentinfo = await this.UserService.findAgents();
      console.log(agentinfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return agentinfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Get('optlist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getOptList() {
    try {
      const operatorinfo = await this.UserService.findOperators();
      console.log('operatorinfo', operatorinfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return operatorinfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async getList(@Req() req: Request, @Body() queryParams: any) {
    // console.log('req', req.user);
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      const result = await this.UserService.getList({
        page,
        limit,
        orderBy,
        // nickname: queryParams.nickname || '',
        username: queryParams.q || '',
        role: queryParams.extra.role,
        // choserole: queryParams.extra.choserole,
        // role: queryParams.role || '',
        // updatedAt: queryParams.updatedAt || '',
        // enabled: queryParams.enabled || false,
      });
      //   return response.send(result);
      console.log('result', result);
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async getUser(@Param('id') id: number) {
    try {
      const userinfo = await this.UserService.findById(BigInt(id));
      const userInfoconvert = this.convertUserInfo(userinfo);
      return userInfoconvert;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateUser(
    @Param('id') id: bigint,
    @Body()
    userDto: UserDto,
    @Res() response,
  ) {
    console.log('userDto', userDto);
    const result = this.UserService.updateUser(id, userDto);

    return response.send(result);
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Req() req: Request, @Body() data: UserDto) {
    console.log('data,data', data);
    const username = data.username;
    const id = data.id;

    try {
      const userinfo = await this.UserService.findById(BigInt(req.user.id));
      if (userinfo.role != 'Root' && userinfo.role != 'Operator') {
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
      // console.log('res', res);
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
        console.log('res', this.convertUserInfo(userDto));
        return this.convertUserInfo(userDto);
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async removeUser(
    @Req() req: Request,
    @Param('id') id: bigint,
  ): Promise<boolean> {
    console.log('id', id);
    const userinfo = await this.UserService.findById(BigInt(req.user.id));
    if (userinfo.role != 'Root' && userinfo.role != 'Operator') {
      throw new HttpException(
        AuthError.USER_NOT_Permission.message,
        AuthError.USER_NOT_Permission.code,
      );
    }
    return this.UserService.removeUser(id);
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
