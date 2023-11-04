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
import { MaterialService } from '../services/material.service';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
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
  ) {}
  private readonly logger = new Logger(MediaController.name);
  @Get('mediaslist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getMedias() {
    try {
      const mediainfo = await this.MediaService.findMedias();
      console.log(mediainfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return mediainfo;
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
      const result = await this.MediaService.getList({
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
      const userinfo = await this.MediaService.findById(BigInt(id));
      const res = this.convertMediaInfo(userinfo);
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
  async materialstore(@Body() data: mediaDto) {
    const name = data.name;

    try {
      const medianame = await this.MediaService.findByUsername(data.name);

      if (medianame) {
        throw new HttpException(
          AuthError.MediaName_IS_SAME.message,
          AuthError.MediaName_IS_SAME.code,
        );
      }
      const res = await this.MediaService.createMaterial(data);
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
    mediaDto: mediaDto,
    @Res() response,
  ) {
    console.log('materialDto', mediaDto);
    const result = this.MediaService.updateMaterial(id, mediaDto);

    return response.send(result);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.MediaService.removeUser(id);
  }
  convertMediaInfo(media: any): any {
    // Make a shallow copy of the user object

    const mediaDto: mediaDto = {
      id: Number(media.id),
      name: media.name,
      enabled: media.enabled,
      // 类型 1 网站 2pc 软件
      type: media.type,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
    // Convert the 'id' property to BigInt

    return mediaDto;
  }
}
