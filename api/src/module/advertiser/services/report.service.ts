import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';
import dayjs from 'dayjs';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async getReportsByDateRange(param: reportParam) {
    const { startDate, endDate, advertiserId, adPlacementId } = param;
    const where: any = {};
    where.date = {
      gte: dayjs(startDate).startOf('day').toDate(), // 大于或等于 startDate
      lte: dayjs(endDate).endOf('day').toDate(), // 小于或等于 endDate
    };

    where.advertiserId = advertiserId;
    if (adPlacementId != null) {
      where.adPlacementId = adPlacementId;
    }
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
      date: dayjs(report.date).toDate(),
      displayCount: Number(report._sum.displayCount),
      clickCount: Number(report._sum.clickCount),
      usedBudget: Number(report._sum.usedBudget),
    }));
    return reportSummary;
  }
  async placements(
    materialId: bigint,
  ): Promise<{ id: number; name: string }[]> {
    const where: any = {};
    if (materialId !== null) {
      where.adMaterialId = materialId;
    }
    const placements = await this.prisma.reportDaily.findMany({
      select: { adPlacementId: true, adPlacementName: true },
      where,
      distinct: ['adPlacementId', 'adPlacementName'],
    });
    const placementarray = placements.map((placement) => ({
      id: Number(placement.adPlacementId),
      name: placement.adPlacementName,
    }));
    return placementarray;
  }
}
