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
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';
import { Request } from 'express';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
@Controller('/api/advertiser/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  private readonly logger = new Logger(ReportController.name);
  @UseInterceptors(ApiResInterceptor)
  @Post('/getReportsByDateRange')
  async getReportsByDateRange(
    @Req() req: Request,
    @Body() data: reportParam,
    @Res() response,
  ): Promise<ReportDto[]> {
    data.advertiserId = req.advertiser.id;
    console.log('reportParam data', data);
    const reportparam: reportParam = {
      advertiserId: data.advertiserId || null,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    const res = await this.reportService.getReportsByDateRange(reportparam);
    const result = {
      data: this.convertReportInfo(res),
      code: 200,
    };
    console.log('report res', result);
    return response.send(result);
  }
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
