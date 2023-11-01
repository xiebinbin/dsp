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
import { AdConsumeService } from '../services/adconsume.service';
import { AdConsumeDto } from '../dto/adconsume.dto';
import { AdvService } from '../services/adv.service';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Controller('/api/ad/')
export class AdCountController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly AdUsedCountService: AdUsedCountService,
    private readonly MaterialService: MaterialService,
    private readonly AdConsumeService: AdConsumeService,
    private readonly AdvService: AdvService,
    private readonly RedisCacheService: RedisCacheService,
  ) {}
  private readonly logger = new Logger(AdCountController.name);
  @Post('show')
  @UseInterceptors(ApiResInterceptor)
  async ApiAdShow(@Body() queryParams: any, @Res() response) {
    const { plan_id } = queryParams;
    const countType = 1;
    const count = 1;

    let isProcessing = false; // 事件锁标志

    try {
      if (isProcessing) {
        // 如果事件锁已经被激活，阻止再次处理
        return {
          code: 400,
          msg: 'Event is already being processed',
          data: null,
        };
      }
      isProcessing = true;

      const placementinfo = await this.PlacementService.findById(
        BigInt(plan_id),
      );
      if (!placementinfo) {
        throw new HttpException(
          AuthError.PLACEMENT_NOT_FOUND.message,
          AuthError.PLACEMENT_NOT_FOUND.code,
        );
      }
      //取消限制
      // if (placementinfo.budget - placementinfo.usedBudget < 0) {
      //   throw new HttpException(
      //     AuthError.PLACEMENT_NOT_ENOUGH.message,
      //     AuthError.PLACEMENT_NOT_ENOUGH.code,
      //   );
      // }

      const Materialinfo = await this.MaterialService.findById(
        BigInt(placementinfo.adMaterialId),
      );
      if (!Materialinfo) {
        throw new HttpException(
          AuthError.Material_NOT_FOUND.message,
          AuthError.Material_NOT_FOUND.code,
        );
      }
      //展现的数据进入缓存
      const adUsedCountdata: AdUsedCountDto = {
        placementId: placementinfo.id,
        adMaterialId: placementinfo.adMaterialId,
        adCount: count,
        countType: countType,
      };
      const placementinfoEndedAt = placementinfo.endedAt;
      const timeDiff = this.calculateTimeDiffWithDefault(
        placementinfoEndedAt,
        60,
      );
      console.log('timeDiff', timeDiff);

      // 组合键
      const countcacheKey = `impression:${adUsedCountdata.placementId}-${adUsedCountdata.adMaterialId}-${adUsedCountdata.countType}`;

      // 调用 increaseAdCountCache 方法
      await this.AdUsedCountService.increaseAdCountCache(
        countcacheKey,
        adUsedCountdata,
        (timeDiff + 60 * 60) * 1000, //冗余1个小时
      );
      // const clickCacheKeys = await this.RedisCacheService.findCountCacheKeys();
      // console.log('clickCacheKeys', clickCacheKeys);
      // const getRedis = await this.RedisCacheService.get(countcacheKey);
      // console.log('adCount:' + getRedis.adCount);
      //展现的数据更新数据库-》放到task中
      // const adUsedCountinfo = await this.AdUsedCountService.UpdateOrCreate(
      //   getRedis,
      // );
      const getRedis = await this.RedisCacheService.get(countcacheKey);
      const userinfo = await this.AdvService.findById(
        BigInt(Materialinfo.advertiserId),
      );
      if (!userinfo) {
        throw new HttpException(
          AuthError.USER_NOT_FOUND.message,
          AuthError.USER_NOT_FOUND.code,
        );
      }

      const prePrice = userinfo.cpmPrice / 1000;

      const adConsumeData: AdConsumeDto = {
        advertiserId: Materialinfo.advertiserId,
        adMaterialId: getRedis.adMaterialId,
        placementId: getRedis.placementId,
        amount: prePrice,
        cpmPrice: userinfo.cpmPrice,
      };
      //消耗的数据进入缓存
      const rechargecacheKey = `recharge:${adConsumeData.advertiserId}-${adConsumeData.adMaterialId}-${adConsumeData.placementId}`;

      await this.AdConsumeService.increaseAdConsumeCache(
        rechargecacheKey,
        adConsumeData,
        (timeDiff + 60 * 60) * 1000, //冗余1个小时
      );
      const getRechargeRedis = await this.RedisCacheService.get(
        rechargecacheKey,
      );
      console.log('getRechargeRedis', getRechargeRedis);

      //消耗的数据更新数据库->转到task
      // const adconsumeinfo = await this.AdConsumeService.UpdateOrCreate(
      //   getRechargeRedis,
      // );

      let responseData = null;
      if (getRechargeRedis) {
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
      console.error(e);
      throw new HttpException(e.message, e.status);
    } finally {
      // 释放事件锁，允许后续事件处理
      isProcessing = false;
    }
  }
  @Post('click')
  @UseInterceptors(ApiResInterceptor)
  async ApiAdClick(@Body() queryParams: any, @Res() response) {
    const { plan_id } = queryParams;
    const countType = 2;
    const count = 1;
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
      const Materialinfo = await this.MaterialService.findById(
        BigInt(placementinfo.adMaterialId),
      );
      if (!Materialinfo) {
        throw new HttpException(
          AuthError.Material_NOT_FOUND.message,
          AuthError.Material_NOT_FOUND.code,
        );
      }
      // const data: AdUsedCountDto = {
      //   placementId: placementinfo.id,
      //   adMaterialId: placementinfo.adMaterialId,
      //   adCount: count,
      //   countType: countType,
      // };
      //点击的数据进入缓存
      const adUsedCountdata: AdUsedCountDto = {
        placementId: placementinfo.id,
        adMaterialId: placementinfo.adMaterialId,
        adCount: count,
        countType: countType,
      };
      const placementinfoEndedAt = placementinfo.endedAt;
      const timeDiff = this.calculateTimeDiffWithDefault(
        placementinfoEndedAt,
        60,
      );
      console.log('timeDiff', timeDiff);

      // 组合键
      const countcacheKey = `click:${adUsedCountdata.placementId}-${adUsedCountdata.adMaterialId}-${adUsedCountdata.countType}`;

      // 调用 increaseAdCountCache 方法
      await this.AdUsedCountService.increaseAdCountCache(
        countcacheKey,
        adUsedCountdata,
        (timeDiff + 60 * 60) * 1000, //冗余1个小时
      );
      const getRedis = await this.RedisCacheService.get(countcacheKey);
      console.log('adCount:' + getRedis.adCount);
      //创建广告量明细->转到task
      // const adUsedCountinfo = await this.AdUsedCountService.UpdateOrCreate(
      //   getRedis,
      // );
      //修改广告计划消耗
      let responseData = null;
      if (getRedis) {
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

      //返回计划创意信息
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
  calculateTimeDiffWithDefault(date: Date, defaultValue: number): number {
    const currentTime = new Date().getTime();
    const timeDiffInSeconds = (date.getTime() - currentTime) / 1000;
    return timeDiffInSeconds < 0 ? defaultValue : timeDiffInSeconds;
  }
}
