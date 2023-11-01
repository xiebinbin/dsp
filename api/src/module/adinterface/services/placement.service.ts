import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdPlacement } from '@prisma/client';

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaClient) {}
  async findById(id: bigint): Promise<AdPlacement | null> {
    return await this.prisma.adPlacement.findFirst({
      where: {
        id,
      },
    });
  }
  async updateAdPlacement(
    adPlacementId: bigint,
    updateData: {
      usedBudget?: bigint;
      displayCount?: bigint;
      clickCount?: bigint;
    },
  ): Promise<void> {
    const data = Object.entries(updateData).reduce(
      (acc, [key, value]) =>
        value !== undefined ? { ...acc, [key]: value } : acc,
      {},
    );

    if (Object.keys(data).length > 0) {
      await this.prisma.adPlacement.update({
        where: {
          id: adPlacementId,
        },
        data,
      });
    }
  }
  async checkPlacementStatus() {
    // 获取当前时间
    const currentTime = new Date();

    // 查询所有广告投放计划
    const placements = await this.prisma.adPlacement.findMany({
      where: {
        NOT: {
          enabled: 2,
        },
      },
    });

    // 遍历每个广告投放计划
    for (const placement of placements) {
      console.log('placement.id', placement.id);
      if (placement.endedAt && placement.endedAt < currentTime) {
        // 如果 endedAt 早于当前时间，将 enabled 设置为 2
        await this.prisma.adPlacement.update({
          where: { id: placement.id },
          data: { enabled: 2 },
        });
      }
    }
  }
}
