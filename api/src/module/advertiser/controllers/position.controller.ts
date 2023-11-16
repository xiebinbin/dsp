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
import { PositionService } from '../services/position.service';
import { PositionDto } from '../dto/position.dto';
import { AdSpecService } from '../services/adspec.service';
@Controller('/api/admin/position')
export class PositionController {
  constructor(
    private readonly PositionService: PositionService,
    private readonly AdSpecService: AdSpecService,
  ) {}
  private readonly logger = new Logger(PositionController.name);
  @Get('positionoptlist')
  @UseInterceptors(ApiResInterceptor)
  async getPosition() {
    try {
      const mediainfo = await this.PositionService.findPositions();
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
      const result = await this.PositionService.getList({
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
      const userinfo = await this.PositionService.findById(BigInt(id));
      const res = this.convertPositionnfo(userinfo);
      console.log('getresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  convertPositionnfo(positon: any): any {
    // Make a shallow copy of the user object

    const positonDto: PositionDto = {
      id: Number(positon.id),
      name: positon.name,
      enabled: positon.enabled,
      // 类型 1 网站 2pc 软件
      type: positon.type,
      createdAt: positon.createdAt,
      updatedAt: positon.updatedAt,
      adSpecId: positon.adSpecId,
      adMediaId: positon.adMediaId,
      adSpec: {
        id: positon.adSpec.id,
        name: positon.adSpec.name,
      },
      adMedia: {
        id: positon.adMedia.id,
        name: positon.adMedia.name,
      },
    };

    return positonDto;
  }
}
