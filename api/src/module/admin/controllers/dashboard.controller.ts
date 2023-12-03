// report.controller.ts

import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Request } from 'express';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { DashboardDto } from '../dto/dashboard.dto';
import { AdvService } from '../services/adv.service';
import { MaterialService } from '../services/material.service';
import { PlacementService } from '../services/placement.service';
import {
  GuardMiddlewareRoot,
  GuardMiddlewareAgent,
} from '../middlewares/guard.middleware';
import { AdReportByDayService } from '../services/adreportbyday.service';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Controller('/api/admin/dahsbord')
export class DashboardController {
  constructor(
    private readonly UserService: UserService,
    private readonly AdvService: AdvService,
    private readonly MaterialService: MaterialService,
    private readonly PlacementService: PlacementService,
    private readonly AdReportByDayService: AdReportByDayService,
    private readonly RedisCacheService: RedisCacheService,
  ) {}

  @Post('/getData')
  @UseGuards(GuardMiddlewareRoot || GuardMiddlewareAgent) // 使用 RootGuard 守卫

  @UseInterceptors(ApiResInterceptor)
  async getData(@Req() req: Request) {
    let agentId = null;
    const role = req.user.role;
    let root = true;
    let Dashboardcachekey = 'DashbaordAdm:';

    if (role != 'Root') {
      agentId = req.user.id;
      root = false;
      Dashboardcachekey = 'DashbaordAdm' + agentId + ':';
    }
    return await this.getDashData(Dashboardcachekey, agentId, root, role);
  }
  private async getDashData(
    cachekey: string,
    agentId: bigint,
    root: boolean,
    role: string,
  ) {
    let placementids;
    const dashboardres = new DashboardDto();
    let cacheres = new DashboardDto();

    cacheres = await this.RedisCacheService.get(cachekey);
    if (cacheres === null) {
      function getDateISO(offset: number): string {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        return date.toISOString().split('T')[0];
      }
      const yestdayformat: string = getDateISO(1);
      const todayformat: string = getDateISO(0);
      const agenttotal = await this.UserService.countByAgent();
      dashboardres.agentNumber = agenttotal;
      if (role != 'Root' && role != 'Operator') {
        dashboardres.agentNumber = 0;
        root = false;
        const advertisersArray = await this.AdvService.findAdvertisers({
          role: role,
          userId: agentId,
        });

        const advs = advertisersArray.map((advertiser) =>
          BigInt(advertiser.id),
        );

        const placementidsArray = await this.PlacementService.findByAdv(advs);
        placementids = placementidsArray.map((plas) => BigInt(plas.id));
      }
      const advtotal = await this.AdvService.countByAdv(agentId);
      dashboardres.advertiserNumber = advtotal;
      const materialtotal = await this.MaterialService.countByAgent(agentId);
      dashboardres.adMaterialNumber = materialtotal;
      const placement = await this.PlacementService.countByAgent(
        Number(agentId),
      );
      dashboardres.ongoingPlans = placement.ongoing;
      dashboardres.completedPlans = placement.completed;
      dashboardres.todayPV = await this.AdReportByDayService.findByIds(
        placementids,
        todayformat,
        root,
      );
      dashboardres.yesterdayPV = await this.AdReportByDayService.findByIds(
        placementids,
        yestdayformat,
        root,
      );
      await this.RedisCacheService.set(cachekey, dashboardres, 5 * 60 * 1000);
      cacheres = dashboardres;
    }
    console.log('cacheres', cacheres);
    return cacheres;
  }
}
