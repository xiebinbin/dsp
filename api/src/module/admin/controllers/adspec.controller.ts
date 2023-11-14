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
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';
import { AdSpecDto } from '../dto/AdSpec.dto';
import { AdSpecService } from '../services/adspec.service';

@Controller('/api/admin/adspec')
export class AdSpecController {
  constructor(private readonly AdSpecService: AdSpecService) {}
  private readonly logger = new Logger(AdSpecController.name);
  @Get('specoptlist')
  @UseInterceptors(ApiResInterceptor)
  async getAdSpec() {
    try {
      const specinfo = await this.AdSpecService.findAdSpecs();
      console.log(specinfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return specinfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      const result = await this.AdSpecService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
      });
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {
    try {
      const userinfo = await this.AdSpecService.findById(BigInt(id));
      const res = this.convertAdSpecnfo(userinfo);
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
  async materialstore(@Body() data: AdSpecDto) {
    const name = data.name;

    try {
      const AdSpecname = await this.AdSpecService.findByUsername(
        data.name,
        data.type,
      );

      if (AdSpecname) {
        throw new HttpException(
          AuthError.ADSPEC_IS_SAME.message,
          AuthError.ADSPEC_IS_SAME.code,
        );
      }
      const res = await this.AdSpecService.createAdSpec(data);
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
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    AdSpecDto: AdSpecDto,
    @Res() response,
  ) {
    const result = this.AdSpecService.updateAdSpec(id, AdSpecDto);

    return response.send(result);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.AdSpecService.removeAdSpec(id);
  }
  convertAdSpecnfo(adSpec: any): any {
    // Make a shallow copy of the user object

    const adSpecdto: AdSpecDto = {
      id: Number(adSpec.id),
      name: adSpec.name,
      enabled: adSpec.enabled,
      // 类型 1 图片 2视频
      type: adSpec.type,
      createdAt: adSpec.createdAt,
      updatedAt: adSpec.updatedAt,
      size: adSpec.size,
    };

    return adSpecdto;
  }
}
