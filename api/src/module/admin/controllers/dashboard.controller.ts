// report.controller.ts

import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
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
import { agent } from 'supertest';
import { GuardMiddlewareAll } from '../middlewares/guard.middleware';
import { AdReportByDayService } from '../services/adreportbyday.service';
import { Role } from '../dto/auth.dto';
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
  private readonly logger = new Logger(DashboardController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getData')
  @UseGuards(GuardMiddlewareAll) // 使用 RootGuard 守卫
  async getData(@Req() req: Request, @Res() response): Promise<DashboardDto> {
    let agentId = null;
    const role = req.user.role;
    let root = true;
    let Dashboardcachekey = 'DashbaordAdm:';

    if (role != 'Root' && role != 'Operator') {
      agentId = req.user.id;
      root = false;
      console.log('agentId', agentId);
      Dashboardcachekey = 'DashbaordAdm' + agentId + ':';
    }
    console.log('Dashboardcachekey', Dashboardcachekey);
    const res = await this.getDashData(Dashboardcachekey, agentId, root, role);

    const responseData = {
      data: res,
      code: 200,
    };
    return response.send(responseData);
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
    console.log('cacheres', cacheres);
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
        // agentId = req.user.id;
        dashboardres.agentNumber = 0;
        root = false;
        // console.log('agentId', agentId);
        // Dashboardcachekey = 'Dashbaord' + agentId + ':';

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

    return cacheres;
  }
}
