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
import { MaterialService } from '../services/material.service';
import { AuthError } from 'src/utils/err_types';
import { AdvService } from '../services/adv.service';
import { MediaService } from '../services/media.service';
import { mediaDto } from '../dto/media.dto';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';

@Controller('/api/admin/media')
export class MediaController {
  constructor(
    private readonly MaterialService: MaterialService,
    private readonly AdvService: AdvService,
    private readonly MediaService: MediaService,
  ) { }
  private readonly logger = new Logger(MediaController.name);
  @Post('mediaslist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getMedias(@Body() qureyParams?: { type: number }) {
    return await this.MediaService.findMedias(qureyParams.type);
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    return await this.MediaService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
    });
  }

  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {

    const userinfo = await this.MediaService.findById(BigInt(id));
    return this.convertMediaInfo(userinfo);
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: mediaDto) {

    const medianame = await this.MediaService.findByUsername(data.name);

    if (medianame) {
      throw new HttpException(
        AuthError.MediaName_IS_SAME.message,
        AuthError.MediaName_IS_SAME.code,
      );
    }
    const res = await this.MediaService.createMaterial(data);
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
    mediaDto: mediaDto,
  ) {
    return await this.MediaService.updateMaterial(id, mediaDto);

  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint) {
    return await this.MediaService.removeUser(id);
  }
  convertMediaInfo(media: any): mediaDto {
    return {
      id: Number(media.id),
      name: media.name,
      enabled: media.enabled,
      // 类型 1 网站 2pc 软件
      type: media.type,
      url: media.url,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }
}
