import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async findMedias() {
    const medias = await this.prisma.adMedia.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return medias.map((media) => ({
      id: media.id,
      name: media.name,
    }));
  }
  async placements(materialId: bigint) {
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
  async findAgents() {
    const agents = await this.prisma.reportDaily.groupBy({
      by: ['agentId', 'agentName'],
    });
  }
  async getReportsByDateRange(param: reportParam) {
    const {
      agentId,
      advertiserId,
      adMaterialId,
      startDate,
      endDate,
      adPlacementId,
      advertisers,
    } = param;
    const formattedStartDate = dayjs(startDate).startOf('day').format(); // 将日期转换为 ISO 8601 字符串
    const formattedEndDate = dayjs(endDate).endOf('day').format();
    const where: any = {};
    where.date = {
      gte: formattedStartDate, // 大于或等于 startDate
      lte: formattedEndDate, // 小于或等于 endDate
    };
    if (agentId !== null) {
      where.agentId = agentId;
    }
    if (adPlacementId !== null) {
      where.adPlacementId = adPlacementId;
    }
    if (advertiserId !== null) {
      where.advertiserId = {
        ...(where.advertiserId || {}),
        equals: advertiserId,
      };
    }

    if (adMaterialId !== null) {
      where.adMaterialId = adMaterialId;
    }
    if (advertisers !== null && advertisers !== undefined) {
      where.advertiserId = {
        ...(where.advertiserId || {}),
        in: advertisers,
      };
    }
    console.log('report where : ', where);

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
      displayCount: report._sum.displayCount,
      clickCount: report._sum.clickCount,
      usedBudget: report._sum.usedBudget,
    }));
    return reportSummary;
  }
}
