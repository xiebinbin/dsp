import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdMedia } from '@prisma/client';
import { ReportDto } from '../dto/report.dto';
import { reportParam } from '../dto/reportparam.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async findMedias(): Promise<{ id: number; name: string }[]> {
    const medias = await this.prisma.adMedia.findMany({
      select: {
        id: true,
        name: true, // 假设代理商有一个用户名字段，你可以根据实际情况选择需要的字段
      },
    });
    const mediasArray = medias.map((agent) => ({
      id: Number(agent.id),
      name: agent.name, // 这里假设代理商的用户名字段为 username
    }));

    return mediasArray;
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
      gte: startDate, // 大于或等于 startDate
      lte: endDate, // 小于或等于 endDate
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
      date: report.date,
      displayCount: Number(report._sum.displayCount),
      clickCount: Number(report._sum.clickCount),
      usedBudget: Number(report._sum.usedBudget),
    }));
    return reportSummary;
  }
}
