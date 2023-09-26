import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
  Inject,
  Res,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AdvService } from '../services/adv.service';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { AdvDto } from '../dto/adv.dto';
import {
  GuardMiddlewareAgent,
  GuardMiddlewareAll,
  GuardMiddlewareRoot,
} from '../middlewares/guard.middleware';

@Controller('/api/admin/advertiser')
export class AdvController {
  constructor(private readonly AdvService: AdvService) {}
  private readonly logger = new Logger(AdvController.name);
  @Post('optlist')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Req() req: Request, @Body() queryParams: any) {
    console.log('getOptList queryParams', queryParams);
    console.log('getOptList req', req.user);
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      // if (req.user.role == 'Root' || req.user.role == 'Operator') {
      //   req.user.role = 'Root';
      // }
      const result = await this.AdvService.findAdvertisers({
        page,
        limit,
        orderBy,
        // nickname: queryParams.nickname || '',
        username: queryParams.q || '',
        role: req.user.role,
        userId: req.user.id,
      });
      //   return response.send(result);
      console.log('result', result);
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
  @UseGuards(GuardMiddlewareAll) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    console.log('queryParams', queryParams);
    console.log('req', req.user);
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      const result = await this.AdvService.getList({
        page,
        limit,
        orderBy,
        username: queryParams.q || '',
        role: queryParams.extra.role,
        userId: req.user.id,
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
  async getUser(@Param('id') id: number) {
    try {
      const userinfo = await this.AdvService.findById(BigInt(id));
      if (userinfo.wallet == null) {
        userinfo.wallet = {
          balance: 0,
        };
      }
      const res = this.convertAdvInfo(userinfo);
      console.log('getresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: AdvDto) {
    console.log('data,data', data);
    const username = data.username;
    const id = data.id;

    try {
      const username = await this.AdvService.findByUsername(data.username);
      console.log('data,username', username);

      if (username) {
        throw new HttpException(
          AuthError.USERNAME_IS_SAME.message,
          AuthError.USERNAME_IS_SAME.code,
        );
      }

      const res = await this.AdvService.createUser(data);
      // console.log('res', res);
      if (!res.id) {
        return false;
      }
      return true;
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
    advDto: AdvDto,
    @Res() response,
  ) {
    console.log('userDto', advDto);
    const result = this.AdvService.updateUser(id, advDto);

    return response.send(result);
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.AdvService.removeUser(id);
  }
  convertAdvInfo(adv: any): any {
    // Make a shallow copy of the user object

    const advDto: AdvDto = {
      id: Number(adv.id),
      companyName: adv.companyName,
      taxNumber: adv.taxNumber,
      username: adv.username,
      password: '......',
      wallet: { balance: adv.wallet.balance },
      cpmPrice: Number(adv.cpmPrice),
      userId: Number(adv.userId),
      updatedAt: null,
      enabled: adv.enabled,
      user: { id: Number(adv.user.id), name: adv.user.nickname }, // 使用对象字面量设置 user 属性的值
    };
    // Convert the 'id' property to BigInt

    return advDto;
  }
}
