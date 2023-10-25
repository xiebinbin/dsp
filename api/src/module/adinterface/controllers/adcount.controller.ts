import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AuthError } from 'src/utils/err_types';
import { AdUsedCountService } from '../services/adusedcount.service';
import { MaterialService } from '../services/material.service';
import { PlacementService } from '../services/placement.service';
import { AdUsedCountDto } from '../dto/adusedcount.dto';
import { contentType } from 'mime-types';

@Controller('/api/adapi/')
export class AdCountController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly AdUsedCountService: AdUsedCountService,
    private readonly MaterialService: MaterialService,
  ) {}
  private readonly logger = new Logger(AdCountController.name);
  @Post('adcount')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(@Body() queryParams: any, @Res() response) {
    const { adMaterialId, adPlacementId, adCount, countType } = queryParams;
    try {
      const placementinfo = await this.PlacementService.findById(
        BigInt(adPlacementId),
      );
      if (!placementinfo) {
        throw new HttpException(
          AuthError.PLACEMENT_NOT_FOUND.message,
          AuthError.PLACEMENT_NOT_FOUND.code,
        );
      }
      if (placementinfo.budget - placementinfo.usedBudget < 0) {
        throw new HttpException(
          AuthError.PLACEMENT_NOT_ENOUGH.message,
          AuthError.PLACEMENT_NOT_ENOUGH.code,
        );
      }
      const Materialinfo = await this.MaterialService.findById(
        BigInt(adMaterialId),
      );
      const data: AdUsedCountDto = {
        placementId: placementinfo.id,
        adMaterialId: placementinfo.adMaterialId,
        adCount: adCount,
        countType: countType,
      };
      //创建广告量明细
      const adUsedCountinfo = await this.AdUsedCountService.createAdUsedCount(
        data,
      );
      //修改广告计划消耗
      const responseData = {
        data: adUsedCountinfo,
      };
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
}
