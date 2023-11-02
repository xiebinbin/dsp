import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdReportByDay } from '@prisma/client';
import { AdReportByDayDto } from '../dto/adreportbyday.dto';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Injectable()
export class AdReportByDayService {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIds(placementIds: bigint[], date: string): Promise<bigint> {
    const totalDisplayCount = await this.prisma.adReportByDay.aggregate({
      where: {
        placementId: {
          in: placementIds,
        },
        date: date,
      },
      _sum: {
        displayCount: true,
      },
    });

    return totalDisplayCount._sum.displayCount;
  }
}
