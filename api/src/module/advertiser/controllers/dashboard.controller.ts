// report.controller.ts

import {
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { DashboardDto } from '../dto/dashboard.dto';
import { AdMaterialService } from '../services/admaterial.service';
import { PlacementService } from '../services/placement.service';
import { GuardMiddlewareAdv } from '../middlewares/guard.middleware';
import { AdvertiserService } from '../services/advertiser.service';
import { RedisCacheService } from '../../cache/services/redis-cache.service';
import { AdReportByDayService } from '../services/adreportbyday.service';
@Controller('/api/advertiser/dashboard')
export class DashboardController {
  constructor(
    private readonly AdMaterialService: AdMaterialService,
    private readonly PlacementService: PlacementService,
    private readonly AdvertiserService: AdvertiserService,
    private readonly RedisCacheService: RedisCacheService,
    private readonly AdReportByDayService: AdReportByDayService,
  ) {}
  private readonly logger = new Logger(DashboardController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getData')
  @UseGuards(GuardMiddlewareAdv) // 使用 RootGuard 守卫
  async getData(@Req() req: Request) {
    const advId = req.advertiser.id;
    // const role = req.user.role;
    const root = false;
    const Dashboardcachekey = 'DashbaordAdv:' + advId + ':';
    let cacheres = await this.RedisCacheService.get(Dashboardcachekey);
    if (cacheres === null) {
      const dashboardres = new DashboardDto();
      function getDateISO(offset: number): string {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        return date.toISOString().split('T')[0];
      }
      const yestdayformat: string = getDateISO(1);
      const todayformat: string = getDateISO(0);
      const materialtotal = await this.AdMaterialService.countByAdvertiser(
        advId,
      );
      dashboardres.adMaterialNumber = materialtotal;
      const placement = await this.PlacementService.countByAdvertiser(advId);
      dashboardres.ongoingPlans = placement.ongoing;
      dashboardres.completedPlans = placement.completed;
      dashboardres.balance = Number((
        await this.AdvertiserService.walletById(advId)
      ).wallet.balance);

      const placementidsArray = await this.PlacementService.findByAdv([advId]);
      const placementids = placementidsArray.map((plas) => BigInt(plas.id));
      
      dashboardres.todayPV = await this.AdReportByDayService.findByIds(
        placementids,
        todayformat,
        root,
      );
      console.log('dashboardres.todayPV',dashboardres.todayPV);
      dashboardres.yesterdayPV = await this.AdReportByDayService.findByIds(
        placementids,
        yestdayformat,
        root,
      );
      console.log('dashboardres', dashboardres);
      await this.RedisCacheService.set(
        Dashboardcachekey,
        dashboardres,
        5 * 60 * 1000,
      );
      cacheres = dashboardres;
    }
    console.log('cacheres', cacheres);
    return cacheres
  }
}
