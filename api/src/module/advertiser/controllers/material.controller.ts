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
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AdMaterialService } from '../services/admaterial.service';

import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { MaterialDto } from '../dto/material.dto';
import { GuardMiddlewareAdv } from '../middlewares/guard.middleware';
import { AdvertiserService } from '../services/advertiser.service';
@Controller('/api/advertiser/material')
export class MaterialController {
  constructor(
    private readonly AdMaterialService: AdMaterialService,
    private readonly AdvertiserService: AdvertiserService,
  ) {}
  private readonly logger = new Logger(MaterialController.name);
  defaultUrl = 'http://static-edu-test.leleshuju.com/';
  @Get('detail/:id')
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number) {
    try {
      const userinfo = await this.AdMaterialService.findById(BigInt(id));
      const res = this.convertAdvInfo(userinfo);
      console.log('getagentresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      console.log('req.advertiser', req.advertiser);

      const Advinfo = await this.AdvertiserService.findById(req.advertiser.id);
      if (!Advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
      }
      console.log('Advinfo', Advinfo);
      const result = await this.AdMaterialService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
        role: '',
        advertiserId: Advinfo?.id || '',
        userId: '',
      });
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('optlist')
  @UseInterceptors(ApiResInterceptor)
  async getOptList(@Req() req: Request, @Body() queryParams: any) {
    const Advinfo = await this.AdvertiserService.findById(
      BigInt(req.advertiser.id),
    );
    if (!Advinfo) {
      throw new HttpException(
        AuthError.ADV_NOT_FOUND.message,
        AuthError.ADV_NOT_FOUND.code,
      );
    }
    const optlist = await this.AdMaterialService.getOptList(Advinfo.id);

    const res = optlist.map((val) => ({
      id: Number(val.id),
      name: val.name,
    }));
    console.log('res', res);
    return res;
  }
  convertAdvInfo(material: any): any {
    // Make a shallow copy of the user object

    const materialDto: MaterialDto = {
      id: Number(material.id),
      name: material.name,
      mediaType: material.mediaType,
      contentType: material.contentType,
      enabled: material.enabled,
      position: material.position,
      content: material.content,
      url: this.defaultUrl + material.url,
      advertiserId: Number(material.advertiserId),

      advertiser: {
        taxNumber: material.advertiser.taxNumber,
        id: Number(material.advertiser.id), // 将 bigint 转换为 number
        companyName: material.advertiser.companyName,
        user: {
          id: Number(material.advertiser.user.id), // 将 bigint 转换为 number
          nickname: material.advertiser.user.nickname,
        }, // 使用对象字面量设置 user 属性的值
      },
    };
    // Convert the 'id' property to BigInt

    return materialDto;
  }
}
