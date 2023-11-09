import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { RechargeService } from '../services/recharge.service';
import { Request } from 'express';
import { RechargeDto } from '../dto/recharge.dto';
import { AuthError } from 'src/utils/err_types';
import { AdvService } from '../services/adv.service';
import { UserService } from '../services/user.service';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';

@Controller('/api/admin/recharge-orders')
export class RechargeController {
  constructor(
    private readonly RechargeService: RechargeService,
    private readonly AdvService: AdvService,
    private readonly UserService: UserService,
  ) {}
  private readonly logger = new Logger(RechargeController.name);

  @Get('list')
  @UseInterceptors(ApiResInterceptor)
  async getList(@Param('id') id: bigint) {
    try {
      const result = await this.RechargeService.findByadvertiserId(id);
      console.log('result', result);
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: RechargeDto, @Req() req: Request) {
    console.log('data,data', data);

    try {
      const userinfo = await this.UserService.findById(BigInt(req.user.id));
      if (userinfo.role != 'Root' && userinfo.role != 'Operator') {
        throw new HttpException(
          AuthError.USER_NOT_Permission.message,
          AuthError.USER_NOT_Permission.code,
        );
      }
      const advinfo = await this.AdvService.findById(BigInt(data.id));

      console.log('data,username', userinfo);

      if (!advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
      }
      const res = await this.RechargeService.create(data);
      return true;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('rechargehistlist')
  @UseInterceptors(ApiResInterceptor)
  async rechargehist(@Body() queryParams: any) {
    console.log('rechargehist queryParams', queryParams);
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      const result = await this.RechargeService.getHistList({
        page,
        limit,
        orderBy,
        // nickname: queryParams.nickname || '',
        advertiserId: queryParams.extra.advertiserId || '',
        createdAt: queryParams.q || '',
        // choserole: queryParams.extra.choserole,
        // role: queryParams.role || '',
        // updatedAt: queryParams.updatedAt || '',
        // enabled: queryParams.enabled || false,
      });
      //   return response.send(result);
      return result;
    } catch (error) {}
  }
}
