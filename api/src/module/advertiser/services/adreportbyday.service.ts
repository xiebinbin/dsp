import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class AdReportByDayService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIds(
    placementIds: bigint[],
    date: string,
    root: boolean,
  ): Promise<number> {
    const where: any = {};
    if (!root) {
      where.placementId = {
        in: placementIds,
      };
    }
    where.date = dayjs(date).startOf('day').toDate();

    const totalDisplayCount = await this.prisma.adReportByDay.aggregate({
      where,
      _sum: {
        displayCount: true,
      },
    });

    return Number(totalDisplayCount._sum.displayCount);
  }
}
