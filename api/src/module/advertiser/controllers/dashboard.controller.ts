// report.controller.ts

import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { DashboardDto } from '../dto/dashboard.dto';
import { AdMaterialService } from '../services/admaterial.service';
import { PlacementService } from '../services/placement.service';
import { agent } from 'supertest';
import { GuardMiddlewareAdv } from '../middlewares/guard.middleware';
import { AdvertiserService } from '../services/advertiser.service';
@Controller('/api/advertiser/dashboard')
export class DashboardController {
  constructor(
    private readonly AdMaterialService: AdMaterialService,
    private readonly PlacementService: PlacementService,
    private readonly AdvertiserService: AdvertiserService,
  ) {}
  private readonly logger = new Logger(DashboardController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getData')
  @UseGuards(GuardMiddlewareAdv) // 使用 RootGuard 守卫
  async getData(@Req() req: Request, @Res() response): Promise<DashboardDto> {
    const advId = req.advertiser.id;

    const dashboardres = new DashboardDto();

    const materialtotal = await this.AdMaterialService.countByAdvertiser(advId);
    dashboardres.adMaterialNumber = materialtotal;
    const placement = await this.PlacementService.countByAdvertiser(advId);
    dashboardres.ongoingPlans = placement.ongoing;
    dashboardres.completedPlans = placement.completed;
    dashboardres.balance = (
      await this.AdvertiserService.walletById(advId)
    ).wallet.balance;
    console.log('dashboardres', dashboardres);
    const responseData = {
      data: dashboardres,
      code: 200,
    };
    return response.send(responseData);
    return dashboardres;
  }
}
