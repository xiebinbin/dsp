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
import { MediaService } from '../services/media.service';
import { mediaDto } from '../dto/media.dto';

@Controller('/api/advertiser/media')
export class MediaController {
  constructor(private readonly MediaService: MediaService) {}
  private readonly logger = new Logger(MediaController.name);
  @Post('mediaslist')
  @UseInterceptors(ApiResInterceptor)
  async getMedias(@Body() qureyParams?: { type: number }) {
    try {
      console.log(qureyParams.type);
      const mediainfo = await this.MediaService.findMedias(qureyParams.type);
      console.log(mediainfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return mediainfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
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

  convertMediaInfo(media: any): any {
    // Make a shallow copy of the user object

    const mediaDto: mediaDto = {
      id: Number(media.id),
      name: media.name,
      enabled: media.enabled,
      // 类型 1 网站 2pc 软件
      type: media.type,
      url: media.url,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
    // Convert the 'id' property to BigInt

    return mediaDto;
  }
}
