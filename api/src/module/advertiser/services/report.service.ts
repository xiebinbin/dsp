import { HttpException, Injectable, Res } from '@nestjs/common';

import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdMedia } from '@prisma/client';
import { userInfo } from 'os';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async getReportsByDateRange(param: reportParam) {
    const { startDate, endDate, advertiserId } = param;
    const where: any = {};
    where.date = {
      gte: startDate, // 大于或等于 startDate
      lte: endDate, // 小于或等于 endDate
    };

    where.advertiserId = advertiserId;

    const reports = await this.prisma.reportDaily.groupBy({
      by: ['date'],
      where,
      _sum: {
        displayCount: true,
        clickCount: true,
        usedBudget: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    const reportSummary: ReportDto[] = reports.map((report) => ({
      date: report.date,
      displayCount: Number(report._sum.displayCount),
      clickCount: Number(report._sum.clickCount),
      usedBudget: Number(report._sum.usedBudget),
    }));
    return reportSummary;
  }
}
