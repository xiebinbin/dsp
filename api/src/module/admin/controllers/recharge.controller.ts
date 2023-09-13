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
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { RechargeService } from '../services/recharge.service';
import { Request } from 'express';
import { RechargeDto } from '../dto/recharge.dto';
import { AuthError } from 'src/utils/err_types';
import { AdvService } from '../services/adv.service';

@Controller('/api/admin/recharge-orders')
export class RechargeController {
  constructor(
    private readonly RechargeService: RechargeService,
    private readonly AdvService: AdvService,
  ) {}
  private readonly logger = new Logger(RechargeController.name);

  @Get('list')
  @UseInterceptors(ApiResInterceptor)
  async getList(@Param('id') id: bigint) {
    try {
      const result = await this.RechargeService.findByadvertiserId(id);
      //   return response.send(result);
      console.log('result', result);
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('store')
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: RechargeDto) {
    console.log('data,data', data);

    try {
      const userinfo = await this.AdvService.findById(BigInt(data.id));

      console.log('data,username', userinfo);

      if (!userinfo) {
        throw new HttpException(
          AuthError.USERNAME_IS_SAME.message,
          AuthError.USERNAME_IS_SAME.code,
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
