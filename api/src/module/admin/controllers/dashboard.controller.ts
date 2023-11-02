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

@Controller('/api/admin/dahsbord')
export class DashboardController {
  constructor(
    private readonly UserService: UserService,
    private readonly AdvService: AdvService,
    private readonly MaterialService: MaterialService,
    private readonly PlacementService: PlacementService,
  ) {}
  private readonly logger = new Logger(DashboardController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getData')
  @UseGuards(GuardMiddlewareAll) // 使用 RootGuard 守卫
  async getData(@Req() req: Request, @Res() response): Promise<DashboardDto> {
    let agentId = null;

    const dashboardres = new DashboardDto();
    const agenttotal = await this.UserService.countByAgent();
    dashboardres.agentNumber = agenttotal;
    if (req.user.role != 'Root' && req.user.role != 'Operator') {
      agentId = req.user.id;
      dashboardres.agentNumber = 0;
    }
    const advtotal = await this.AdvService.countByAdv(agentId);
    dashboardres.advertiserNumber = advtotal;
    const materialtotal = await this.MaterialService.countByAgent(agentId);
    dashboardres.adMaterialNumber = materialtotal;
    const placement = await this.PlacementService.countByAgent(agentId);
    dashboardres.ongoingPlans = placement.ongoing;
    dashboardres.completedPlans = placement.completed;
    const responseData = {
      data: dashboardres,
      code: 200,
    };
    return response.send(responseData);
  }
}
