import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  UseInterceptors,
  Logger,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AuthError } from 'src/utils/err_types';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';
import { AdSpecDto } from '../dto/adspec.dto';
import { AdSpecService } from '../services/adspec.service';

@Controller('/api/admin/adspec')
export class AdSpecController {
  constructor(private readonly AdSpecService: AdSpecService) { }
  private readonly logger = new Logger(AdSpecController.name);
  @Get('specoptlist')
  @UseInterceptors(ApiResInterceptor)
  async getAdSpec() {
    return await this.AdSpecService.findAdSpecs();
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    return await this.AdSpecService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
    });
  }

  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {
    const info = await this.AdSpecService.findById(BigInt(id));
    console.log('info', info);
    return this.convertAdSpecnfo(info);
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: AdSpecDto) {

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
    if (!res.id) {
      return false;
    }
    return true;
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    AdSpecDto: AdSpecDto,
  ) {
    return await this.AdSpecService.updateAdSpec(id, AdSpecDto);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    return await this.AdSpecService.removeAdSpec(id);
  }
  convertAdSpecnfo(adSpec: any): AdSpecDto {
    return {
      id: Number(adSpec.id),
      name: adSpec.name,
      enabled: adSpec.enabled,
      // 类型 1 图片 2视频
      type: adSpec.type,
      createdAt: adSpec.createdAt,
      updatedAt: adSpec.updatedAt,
      size: adSpec.size,
    };
  }
}
