import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';
import dayjs from 'dayjs';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async findMedias() {
    const medias = await this.prisma.adMedia.findMany({
      select: {
        id: true,
        name: true, // 假设代理商有一个用户名字段，你可以根据实际情况选择需要的字段
      },
    });
    return medias.map((media) => ({
      id: media.id,
      name: media.name,
    }));
  }
  async placements(
    materialId: bigint,
  ) {
    const where: any = {};
    if (materialId !== null) {
      where.adMaterialId = materialId;
    }
    const placements = await this.prisma.reportDaily.findMany({
      select: { adPlacementId: true, adPlacementName: true },
      where,
      distinct: ['adPlacementId', 'adPlacementName'],
    });
    return placements.map((placement) => ({
      id: placement.adPlacementId,
      name: placement.adPlacementName,
    }));
  }
  async getReportsByDateRange(param: reportParam) {
    const {
      agentId,
      advertiserId,
      adMaterialId,
      startDate,
      endDate,
      adPlacementId,
    } = param;
    const where: any = {};
    where.date = {
      gte: dayjs(startDate).toDate(), // 大于或等于 startDate
      lte: dayjs(endDate).toDate(), // 小于或等于 endDate
    };
    if (agentId !== null) {
      where.agentId = agentId;
    }
    if (adPlacementId !== null) {
      where.adPlacementId = adPlacementId;
    }
    if (advertiserId !== null) {
      where.advertiserId = advertiserId;
    }

    if (adMaterialId !== null) {
      where.adMaterialId = adMaterialId;
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
}
