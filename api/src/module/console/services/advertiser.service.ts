import { Injectable } from '@nestjs/common';
import { Advertiser } from '@prisma/client';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class AdvertiserService {
  constructor(private readonly prisma: PrismaService) {}
  async findByUsername(username: string): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        username,
      },
    });
  }
  async findById(id: bigint): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        id,
      },
    });
  }

  async clearWalletData(id: bigint) {
    await this.prisma.bill.deleteMany({
      where: {
        advertiserId: id,
      },
    });
    await this.prisma.wallet.update({
      where: {
        advertiserId: id,
      },
      data: {
        balance: 0,
        totalAmount: 0,
        totalUsed: 0,
      },
    });
  }
  async ClearAdData(id: bigint) {
    const placements = await this.prisma.adPlacement.findMany({
      where: {
        advertiserId: id,
      },
    });
    const placementIds = placements.map((p) => p.id);
    await this.prisma.adReportByDay.deleteMany({
      where: {
        placementId: {
          in: placementIds,
        },
      },
    });
    await this.prisma.adUsedCount.deleteMany({
      where: {
        placementId: {
          in: placementIds,
        },
      },
    });
    await this.prisma.adMediaRelation.deleteMany({
      where: {
        placementId: {
          in: placementIds,
        },
      },
    })
    await this.prisma.timeCurvePlacementByDay.deleteMany({
      where: {
        placementId: {
          in: placementIds,
        },
      },
    });

    await this.prisma.adConsume.deleteMany({
      where: {
        advertiserId: id,
      },
    });

    await this.prisma.reportDaily.deleteMany({
      where: {
        advertiserId: id,
      },
    });
    await this.prisma.reportPlacement.deleteMany({
      where: {
        advertiserId: id,
      },
    });
    await this.prisma.adPlacement.deleteMany({
      where: {
        advertiserId: id,
      },
    });
  }
}
