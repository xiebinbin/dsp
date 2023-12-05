// report.controller.ts

import {
  Body,
  Controller,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { reportParam } from '../dto/reportparam.dto';
import { Request } from 'express';
import { AdvService } from '../services/adv.service';

import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
@Controller('/api/admin/report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly AdvService: AdvService,
  ) {}
  @UseInterceptors(ApiResInterceptor)
  @Post('/getReportsByDateRange')
  async getReportsByDateRange(
    @Req() req: Request,
    @Body() data: reportParam,
  ){
    if (req.user.role != 'Root' && req.user.role != 'Operator') {
      data.agentId = req.user.id;
    }
    if (req.user.role == 'Operator') {
      const advs = await this.AdvService.findByOperator(req.user.id);
      console.log('role is Operator advs', advs);
      data.advertisers = advs.map((adv) => adv.id);
    }
    const reportparam: reportParam = {
      agentId: data.agentId || null,
      advertiserId: data.advertiserId || null,
      adMaterialId: data.adMaterialId || null,
      adPlacementId: data.adPlacementId || null,
      advertisers: Array.isArray(data.advertisers) ? data.advertisers : null,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    return await this.reportService.getReportsByDateRange(reportparam);

  }
  @UseInterceptors(ApiResInterceptor)
  @Post('/placementOptlist')
  async getPlacementOptList(
    @Body() queryParams: any,
  ) {
    const { q } = queryParams;
    const materialId = q;
    const items = await this.reportService.placements(materialId);
    return {
      data: items,
    }
  }
}
