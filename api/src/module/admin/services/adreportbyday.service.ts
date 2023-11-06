import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class AdReportByDayService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIds(placementIds: bigint[], date: string, root: boolean) {
    const where: any = {};
    if (!root) {
      where.placementId = {
        in: placementIds,
      };
    }

    const formattedStartDate = dayjs(date).startOf('day').format();
    const formattedEndDate = dayjs(date).endOf('day').format();
    where.date = {
      gte: formattedStartDate, // 大于或等于 startDate
      lte: formattedEndDate, // 小于或等于 endDate
    };
    console.log('AdReportByDayService date', where);
    const totalDisplayCount = await this.prisma.adReportByDay.aggregate({
      where,
      _sum: {
        displayCount: true,
      },
    });

    return totalDisplayCount._sum.displayCount || 0n;
  }
}
