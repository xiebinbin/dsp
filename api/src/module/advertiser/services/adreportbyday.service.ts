import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdReportByDay } from '@prisma/client';
import { AdReportByDayDto } from '../dto/adreportbyday.dto';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

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
