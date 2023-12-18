import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { MaterialService } from '../services/material.service';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { MaterialDto } from '../dto/material.dto';
import { AdvService } from '../services/adv.service';
import {
  GuardMiddlewareRoot,
  GuardMiddlewareAgent,
} from '../middlewares/guard.middleware';

@Controller('/api/admin/material')
export class MaterialController {
  constructor(
    private readonly MaterialService: MaterialService,
    private readonly AdvService: AdvService,
  ) { }
  defaultUrl = 'https://cdn.adbaba.net/';

  @Post('list')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareAgent) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy, extra } = queryParams;
    if (req.user.role != 'Root') {
      extra.userId = req.user.id;
    }
    return await this.MaterialService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
      role: extra.role,
      advertiserId: extra.advid,
      userId: extra.userId,
    });
  }
  @Post('optlist')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy, extra } = queryParams;

    if (req.user.role != 'Root') {
      extra.agentid = req.user.id;
    }
    extra.role = req.user.role;

    const result = await this.MaterialService.getList({
      page,
      limit,
      orderBy,
      advertiserId: queryParams.q || '',
      role: extra.role,
    });
    return {
      data: result.data.map((res) => ({
        id: res.id,
        name: res.name,
        advertiserId: res.advertiserId,
      }))
    };
  }
  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    let Advinfo; // 将 Advinfo 的定义移到方法作用域之外

    if (req.user.role != 'Root' && req.user.role != 'Operator') {
      Advinfo = await this.AdvService.findById(BigInt(req.user.id));
      if (!Advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
      }
    }

    return await this.MaterialService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
      role: '',
      advertiserId: Advinfo?.id || '',
      userId: '',
    });
  }

  @Get(':id')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareAgent) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {
    const userinfo = await this.MaterialService.findById(BigInt(id));
    return this.convertAdvInfo(userinfo);
  }
  @Get('detail/:id')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareAgent) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number) {
    const userinfo = await this.MaterialService.findById(BigInt(id));
    return this.convertAgentInfo(userinfo);
  }
  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: MaterialDto) {
    const materialname = await this.MaterialService.findByUsername(data.name);

    if (materialname) {
      throw new HttpException(
        AuthError.MaterialName_IS_SAME.message,
        AuthError.MaterialName_IS_SAME.code,
      );
    }
    const Advinfo = await this.AdvService.findById(BigInt(data.advertiserId));
    if (!Advinfo) {
      throw new HttpException(
        AuthError.ADV_NOT_FOUND.message,
        AuthError.ADV_NOT_FOUND.code,
      );
    }
    const res = await this.MaterialService.createMaterial(data);
    if (!res.id) {
      return false;
    }
    return true;
  }
  @Put(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    materialDto: MaterialDto,
  ) {
    return await this.MaterialService.updateMaterial(id, materialDto);
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async removeUser(@Param('id') id: bigint) {
    return await this.MaterialService.removeUser(id);
  }

  convertAdvInfo(material: any): MaterialDto {
    return {
      id: Number(material.id),
      name: material.name,
      mediaType: material.mediaType,
      contentType: material.contentType,
      enabled: material.enabled,
      positionId: material.positionId,
      adPosition: material?.adPosition
        ? {
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
        }
        : null,
      content: material.content,
      url: this.defaultUrl + material.url,
      advertiserId: Number(material.advertiserId),
      jumpUrl: material.jumpUrl,
      advertiser: {
        domainName: material.advertiser.domainName,
        id: Number(material.advertiser.id), // 将 bigint 转换为 number
        companyName: material.advertiser.companyName,
        user: {
          id: Number(material.advertiser.user.id), // 将 bigint 转换为 number
          nickname: material.advertiser.user.nickname,
        }, // 使用对象字面量设置 user 属性的值
      },
    };
  }
  convertAgentInfo(material: any): MaterialDto {

    return {
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
      advertiserId: null,
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
  }
}
