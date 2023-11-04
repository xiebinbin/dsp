import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
    where.date = date;

    const totalDisplayCount = await this.prisma.adReportByDay.aggregate({
      where,
      _sum: {
        displayCount: true,
      },
    });

    return Number(totalDisplayCount._sum.displayCount);
  }
}
