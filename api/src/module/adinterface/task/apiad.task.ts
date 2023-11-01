import { Logger, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisCacheService } from '../../cache/services/redis-cache.service';
import { AdUsedCountService } from '../services/adusedcount.service';
import { AdConsumeService } from '../services/adconsume.service';
import { PlacementService } from '../services/placement.service';
import { AdvService } from '../services/adv.service';
@Injectable()
export class ApiAdTask {
  private readonly logger = new Logger(ApiAdTask.name);

  constructor(
    private readonly RedisCacheService: RedisCacheService,
    private readonly AdUsedCountService: AdUsedCountService,
    private readonly AdConsumeService: AdConsumeService,
    private readonly PlacementService: PlacementService,
    private readonly AdvService: AdvService,
  ) {}
  // 使用 @Cron 装饰器定义任务的调度时间表
  @Cron('45 * * * * *') // 在每分钟的第 45 秒执行
  async ApiHandleCron() {
    console.log('定时任务执行', new Date());
    //1更新点击逻辑
    const clickCacheKeys = await this.RedisCacheService.findClickCacheKeys();
    console.log('clickCacheKeys', clickCacheKeys);
    for (const clickKey of clickCacheKeys) {
      const getRedis = await this.RedisCacheService.get(clickKey);
      console.log('click adCount:' + getRedis.adCount);

      // 点击明细刷新到数据库
      const adUsedCountinfo = await this.AdUsedCountService.UpdateOrCreate(
        getRedis,
      );
      //更新点击数据到计划表:
      await this.PlacementService.updateAdPlacement(
        adUsedCountinfo.placementId,
        { displayCount: adUsedCountinfo.adCount },
      );
    }
    //2更新展示逻辑
    const impressionCacheKeys =
      await this.RedisCacheService.findImpressionCacheKeys();
    console.log('impressionCacheKeys', impressionCacheKeys);
    for (const impressionKey of impressionCacheKeys) {
      const getRedis = await this.RedisCacheService.get(impressionKey);
      console.log('impression adCount:' + getRedis.adCount);

      // 展示明细刷新到数据库
      const adUsedCountinfo = await this.AdUsedCountService.UpdateOrCreate(
        getRedis,
      );
      //更新 展示数据到计划表:
      await this.PlacementService.updateAdPlacement(
        adUsedCountinfo.placementId,
        { displayCount: adUsedCountinfo.adCount },
      );
    }
    //3消耗逻辑
    const rechargeCacheKeys =
      await this.RedisCacheService.findRechargeCacheKeys();
    console.log('rechargeCacheKeys', rechargeCacheKeys);
    for (const rechargeCacheKey of rechargeCacheKeys) {
      const getRechargeRedis = await this.RedisCacheService.get(
        rechargeCacheKey,
      );
      console.log('amount:' + getRechargeRedis.amount);

      // 消耗明细刷新到数据库
      const adUsedAmountinfo = await this.AdConsumeService.UpdateOrCreate(
        getRechargeRedis,
      );
      //更新消耗数据到计划表:
      await this.PlacementService.updateAdPlacement(
        adUsedAmountinfo.placementId,
        { usedBudget: adUsedAmountinfo.amount },
      );
      //更新广告主余额
      await this.AdvService.deductBalance(adUsedAmountinfo.advertiserId);
    }
  }
  @Cron('55 * * * * *') // 在每分钟的第 45 秒执行
  async PlacementHandleCron() {
    await this.PlacementService.checkPlacementStatus();
  }
}
