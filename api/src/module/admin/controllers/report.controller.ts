// report.controller.ts

import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';
import { Request } from 'express';
import { AdvService } from '../services/adv.service';

import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
// import { ReportPlacementService } from '../services/reportplacment.service';
@Controller('/api/admin/report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly AdvService: AdvService, // private readonly ReportPlacementService: ReportPlacementService,
  ) {}
  private readonly logger = new Logger(ReportController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getReportsByDateRange')
  async getReportsByDateRange(
    @Req() req: Request,
    @Body() data: reportParam,
    @Res() response,
  ): Promise<ReportDto[]> {
    if (req.user.role != 'Root' && req.user.role != 'Operator') {
      data.agentId = req.user.id;
    }
    if (req.user.role == 'Operator') {
      const advs = await this.AdvService.findByOperator(req.user.id);
      console.log('role is Operator advs', advs);
      data.advertisers = advs.map((adv) => adv.id);
    }
    console.log('reportParam data', data);
    const reportparam: reportParam = {
      agentId: data.agentId || null,
      advertiserId: data.advertiserId || null,
      adMaterialId: data.adMaterialId || null,
      adPlacementId: data.adPlacementId || null,
      advertisers: Array.isArray(data.advertisers) ? data.advertisers : null,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    console.log('reportparam', reportparam);
    const res = await this.reportService.getReportsByDateRange(reportparam);
    const result = {
      data: this.convertReportInfo(res),
      code: 200,
    };
    console.log('report res', result);
    return response.send(result);
  }
  @UseInterceptors(ApiResInterceptor)
  @Post('/placementOptlist')
  async getPlacementOptList(
    @Req() req: Request,
    @Body() queryParams: any,
    @Res() response,
  ) {
    const { q } = queryParams;
    const materialId = q;
    const res = await this.reportService.placements(materialId);
    console.log(res);
    const result = {
      data: { data: res, code: 200 },
    };
    console.log('report res', result);
    return response.send(result);
  }
  // @UseInterceptors(ApiResInterceptor)
  // @Post('/AgentsByReportPlacement')
  // async AgentsByReportPlacement(
  //   @Req() req: Request,
  //   @Body() data: reportParam,
  //   @Res() response,
  // ) {
  //   const res = await this.ReportPlacementService.findAgents();
  //   const result = {
  //     data: res,
  //     code: 200,
  //   };
  //   console.log('report AgentsByReportPlacement', result);
  //   return response.send(result);
  // }
  // @UseInterceptors(ApiResInterceptor)
  // @Post('/placement/AgentsByReportPlacement')
  // async AgentsByReportPlacement(
  //   @Req() req: Request,
  //   @Body() data: reportParam,
  //   @Res() response,
  // ) {
  //   const res = await this.ReportPlacementService.findAgents();
  //   const result = {
  //     data: res,
  //     code: 200,
  //   };
  //   console.log('report res', result);
  //   return response.send(result);
  // }
  // @UseInterceptors(ApiResInterceptor)
  // @Post('/placement/getReportsByPlacement')
  // async getReportsByPlacement(
  //   @Req() req: Request,
  //   @Body() data: reportParam,
  //   @Res() response,
  // ): Promise<ReportDto[]> {
  //   if (req.user.role != 'Root' && req.user.role != 'Operator') {
  //     data.agentId = req.user.id;
  //   }
  //   if (req.user.role == 'Operator') {
  //     const advs = await this.AdvService.findByOperator(req.user.id);
  //     console.log('role is Operator advs', advs);
  //     data.advertisers = advs.map((adv) => adv.id);
  //   }
  //   console.log('reportParam data', data);
  //   const reportparam: reportParam = {
  //     agentId: data.agentId || null,
  //     advertiserId: data.advertiserId || null,
  //     adMaterialId: data.adMaterialId || null,
  //     adPlacementId: data.adPlacementId || null,
  //     advertisers: Array.isArray(data.advertisers) ? data.advertisers : null,
  //     startDate: data.startDate,
  //     endDate: data.endDate,
  //   };
  //   console.log('reportparam', reportparam);
  //   const res =
  //     await this.ReportPlacementService.getReportsPlacementByDateRange(
  //       reportparam,
  //     );
  //   const result = {
  //     data: this.convertReportInfo(res),
  //     code: 200,
  //   };
  //   console.log('report res', result);
  //   return response.send(result);
  // }
  // @UseInterceptors(ApiResInterceptor)
  // @Post('/placement/placementOptlist')
  // async getPlacementOptListByPlacement(
  //   @Req() req: Request,
  //   @Body() queryParams: any,
  //   @Res() response,
  // ) {
  //   const { q } = queryParams;
  //   const materialId = q;
  //   const res = await this.ReportPlacementService.placements(materialId);
  //   console.log(res);
  //   const result = {
  //     data: { data: res, code: 200 },
  //   };
  //   console.log('report res', result);
  //   return response.send(result);
  // }
  convertReportInfo(report: any): any {
    const convertedData = report.map((item) => {
      for (const key in item) {
        if (typeof item[key] === 'bigint') {
          item[key] = Number(item[key]);
        }
      }
      return item;
    });
    return convertedData;
  }
}
