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

@Controller('/api/ad/')
export class AdCountController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly AdUsedCountService: AdUsedCountService,
    private readonly MaterialService: MaterialService,
  ) {}
  private readonly logger = new Logger(AdCountController.name);
  @Post('show')
  @UseInterceptors(ApiResInterceptor)
  async ApiAdShow(@Body() queryParams: any, @Res() response) {
    const { plan_id } = queryParams;
    const countType = 1;
    try {
      const placementinfo = await this.PlacementService.findById(
        BigInt(plan_id),
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
      const Materialinfo = await this.MaterialService.findById(BigInt(plan_id));
      const data: AdUsedCountDto = {
        placementId: placementinfo.id,
        adMaterialId: placementinfo.adMaterialId,
        adCount: 1,
        countType: countType,
      };
      //创建广告量明细
      const adUsedCountinfo = await this.AdUsedCountService.createAdUsedCount(
        data,
      );
      //修改广告计划消耗
      let responseData = null;
      if (adUsedCountinfo) {
        responseData = {
          code: 200,
          msg: 'ok',
          data: null,
        };
      } else {
        responseData = {
          code: 400,
          msg: 'error',
          data: null,
        };
      }
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('click')
  @UseInterceptors(ApiResInterceptor)
  async ApiAdClick(@Body() queryParams: any, @Res() response) {
    const { plan_id } = queryParams;
    const countType = 2;
    try {
      const placementinfo = await this.PlacementService.findById(
        BigInt(plan_id),
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
      const Materialinfo = await this.MaterialService.findById(BigInt(plan_id));
      if (!Materialinfo) {
        throw new HttpException(
          AuthError.Material_NOT_FOUND.message,
          AuthError.Material_NOT_FOUND.code,
        );
      }
      const data: AdUsedCountDto = {
        placementId: placementinfo.id,
        adMaterialId: placementinfo.adMaterialId,
        adCount: 1,
        countType: countType,
      };
      //创建广告量明细
      const adUsedCountinfo = await this.AdUsedCountService.createAdUsedCount(
        data,
      );
      //修改广告计划消耗
      let responseData = null;
      if (adUsedCountinfo) {
        responseData = {
          code: 200,
          msg: 'ok',
          data: null,
        };
      } else {
        responseData = {
          code: 400,
          msg: 'error',
          data: null,
        };
      }
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('info')
  @UseInterceptors(ApiResInterceptor)
  async ApiAdInfo(@Body() queryParams: any, @Res() response) {
    const { plan_id } = queryParams;
    try {
      const placementinfo = await this.PlacementService.findById(
        BigInt(plan_id),
      );
      if (!placementinfo) {
        throw new HttpException(
          AuthError.PLACEMENT_NOT_FOUND.message,
          AuthError.PLACEMENT_NOT_FOUND.code,
        );
      }
      const Materialinfo = await this.MaterialService.findById(BigInt(plan_id));

      //修改广告计划消耗
      let responseData = null;
      if (Materialinfo) {
        const ad: any = {
          ad: {
            media_url: Materialinfo.url,
            type: 'image',
            jump_url: Materialinfo.jumpurl,
          },
        };
        responseData = {
          code: 200,
          msg: 'ok',
          data: ad,
        };
      } else {
        responseData = {
          code: 400,
          msg: '广告创意不存在',
          data: null,
        };
      }
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
}
