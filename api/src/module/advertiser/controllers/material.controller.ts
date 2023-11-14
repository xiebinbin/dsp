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
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AdMaterialService } from '../services/admaterial.service';

import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { MaterialDto } from '../dto/material.dto';
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
      name: null,
      mediaType: material.mediaType,
      contentType: material.contentType,
      enabled: null,
      adPosition: {
        id: Number(material.adPosition.id),
        name: material.adPosition.name,
        type: Number(material.adPosition.type),
        adSpec: {
          id: Number(material.adPosition.adSpec.id),
          name: material.adPosition.adSpec.name, //规格名称
          type: Number(material.adPosition.adSpec.type), //规格类型 图片，视频
        },
        adMedia: {
          id: Number(material.adPosition.adMedia.id),
          name: material.adPosition.adMedia.name,
        },
      },
      content: material.content,
      url: this.defaultUrl + material.url,
      jumpUrl: material.jumpUrl,
      advertiser: {
        id: Number(material.advertiser.id),
        companyName: material.advertiser.companyName,
        domainName: material.advertiser.domainName,
        user: {
          id: null,

          nickname: null,
        }, // 使用对象字面量设置 user 属性的值
      },
      positionId: Number(material.adPosition.id),
    };
    // Convert the 'id' property to BigInt

    return materialDto;
  }
}
