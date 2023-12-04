import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Res,
  Delete,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { PlacementService } from '../services/placement.service';
import { MediaRelationService } from '../services/mediarelation.service';
import { PlacementDto } from '../dto/placement.dto';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { AdvService } from '../services/adv.service';
import {
  GuardMiddlewareRoot,
  GuardMiddlewareAgent,
} from '../middlewares/guard.middleware';
import dayjs from 'dayjs';
import 'moment-timezone';
@Controller('/api/admin/placement/')
export class PlacementController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly MediaRelationService: MediaRelationService,
    private readonly AdvService: AdvService,
  ) { }
  @Post('optlist/:id')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Param('id') id: number) {
    const placementinfo = await this.PlacementService.findById(BigInt(id));
    return await this.MediaRelationService.findMediaRelations(
      placementinfo.id,
    );
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareAgent) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy, extra } = queryParams;
    if (req.user.role != 'Root' && req.user.role != 'Operator') {
      extra.agentid = req.user.id;
    }
    return await this.PlacementService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
      advertiserId: extra.advid || '', //广告主
      userId: extra.agentid || '', //代理商
      materialname: extra.materialname || '',
    });
  }
  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getUser(@Param('id') id: number) {
    const placementinfo = await this.PlacementService.findById(BigInt(id));
    const timeInfo = await this.PlacementService.placementTimeRange(
      Number(placementinfo.id),
    );
    const convertdata = this.convertPlacementInfo(placementinfo);
    if (timeInfo.length > 0) {
      const parsedTimeInfo = JSON.parse(timeInfo[0]);
      if (parsedTimeInfo.timerange) {
        convertdata.timerange = parsedTimeInfo.timerange;
      }
    }
    return convertdata;
  }
  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: PlacementDto) {
    data.cpmPrice = Number(data.cpmPrice) * 100;
    const res = await this.PlacementService.createPlacement(data);
    const mediarelation = data.medias.map((mediaId) => ({
      mediaId: mediaId,
      placementId: res.id, // 这里需要修改为正确的获取 AdPlacement 的方式
      enabled: true,
    }));
    await this.MediaRelationService.createMediaRelation(mediarelation);
    if (!res.id) {
      return false;
    }
    return true;
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async updatePlacement(
    @Param('id') id: bigint,
    @Body()
    data: PlacementDto,
  ) {
    const endedAtDate = new Date(data.endedAt);
    const currentDate = new Date();
    const timeDifference = Number(endedAtDate) - Number(currentDate);
    if (timeDifference > 0) {
      data.enabled = 1;
    } else {
      data.enabled = 2;
    }
    data.cpmPrice = Number(data.cpmPrice) * 100;
    data.startedAt = dayjs(data.startedAt).format();
    data.endedAt = dayjs(data.endedAt).format();

    await this.PlacementService.updatePlacement(id, data);
    const mediarelation = data.medias.map((mediaId) => ({
      mediaId: mediaId,
      placementId: id, // 这里需要修改为正确的获取 AdPlacement 的方式
      enabled: true,
    }));
    return await this.MediaRelationService.updateMediaRelation(
      id,
      mediarelation,
    );
  }
  @Put('pending/:id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateEnabled(
    @Param('id') id: bigint,
    @Body()
    data: { enabled: number },
  ) {
    return await this.PlacementService.updateEnabled(id, data.enabled);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint) {
    return await this.PlacementService.removePlacement(id);
  }
  @Get('detail/:id')
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number) {
    const userinfo = await this.PlacementService.findById(BigInt(id));
    const res = this.convertPlacementInfo(userinfo);
    return {
      data: res,
      total: res.total,
    };
  }

  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(
    @Req() req: Request,
    @Body() queryParams: any,
  ) {
    const { page, limit, orderBy, extra } = queryParams;
    let Advinfo;
    if (req.user.role != 'Root') {
      Advinfo = await this.AdvService.findById(BigInt(req.user.id));
      if (!Advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
      }
    }

    const result = await this.PlacementService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
      role: '',
      advertiserId: Advinfo?.id || '',
      userId: '',
      materialname: extra.materialname || '',
    });
    return {
      data: result,
      total: result.total,
    };
  }
  convertPlacementInfo(placement: any): any {
    const newPlacement = { ...placement };
    newPlacement.id = Number(placement.id);
    newPlacement.advertiserId = Number(placement.advertiserId);
    newPlacement.adMaterialId = Number(placement.adMaterialId);
    newPlacement.budget = Number(placement.budget);
    newPlacement.usedBudget = Number(placement.usedBudget);
    newPlacement.displayCount = Number(placement.displayCount);
    newPlacement.clickCount = Number(placement.clickCount);
    newPlacement.adMediaRelations = placement.adMediaRelations.map((val) => ({
      mediaId: Number(val.mediaId),
      mediaName: val.adMedia.name,
    }));
    newPlacement.cpmPrice = Number(placement.cpmPrice);
    newPlacement.advertiser.id = Number(placement.advertiser.id);
    newPlacement.advertiser.user.id = Number(placement.advertiser.user.id);
    newPlacement.name = placement.name;
    return newPlacement;
  }
}
