import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Res,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { PlacementService } from '../services/placement.service';
import { Request } from 'express';
import { AdvertiserService } from '../services/advertiser.service';
import { AuthError } from 'src/utils/err_types';

@Controller('/api/advertiser/placement/')
@UseInterceptors(ApiResInterceptor)
export class PlacementController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly AdvertiserService: AdvertiserService,
  ) {}
  private readonly logger = new Logger(PlacementController.name);

  @Get('detail/:id')
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number, @Res() response) {
    try {
      const userinfo = await this.PlacementService.findById(BigInt(id));
      const res = this.convertPlacementInfo(userinfo);
      console.log('convertPlacementInfo', res);
      const responseData = {
        data: res,
        total: res.total,
      };
      return response.send(responseData);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(
    @Req() req: Request,
    @Body() queryParams: any,
    @Res() response,
  ) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      console.log('req.advertiser.id', req.advertiser.id);
      const Advinfo = await this.AdvertiserService.findById(
        BigInt(req.advertiser.id),
      );
      if (!Advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
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
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
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
      mediaName: val.admedia.name,
    }));
    newPlacement.advertiser.id = Number(placement.advertiser.id);
    newPlacement.advertiser.user.id = Number(placement.advertiser.user.id);

    return newPlacement;
  }
}
