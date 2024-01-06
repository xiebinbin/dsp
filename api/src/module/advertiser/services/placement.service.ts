import { Injectable } from '@nestjs/common';

import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdPlacement } from '@prisma/client';

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaClient) {}
  async findByname(name: string): Promise<AdPlacement | null> {
    return await this.prisma.adPlacement.findFirst({
      where: {
        name,
      },
    });
  }
  async findByAdv(advs: bigint[]) {
    return await this.prisma.adPlacement.findMany({
      where: { advertiserId: { in: advs } },
      select: { id: true },
    });
  }
  async findById(id: bigint) {
    const Placementinfo = await this.prisma.adPlacement.findFirst({
      select: {
        id: true,
        name: true,
        enabled: true,
        adMaterialId: true,
        adMaterial: {
          select: {
            name: true,
            url: true,
          },
        },
        mediaType: true,
        advertiserId: true,
        budget: true,
        usedBudget: true,
        displayCount: true,
        clickCount: true,
        startedAt: true,
        endedAt: true,
        advertiser: {
          select: {
            id: true,
            companyName: true,
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        adMediaRelations: {
          select: {
            mediaId: true,
            adMedia: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        id,
      },
    });

    return Placementinfo;
  }
  async getList(queryParams: any) {
    const {
      page,
      limit,
      name,
      orderBy,
      role,
      advertiserId,
      userId,
      materialname,
    } = queryParams;
    const where: any = {};

    if (!advertiserId) {
      throw AuthError.USER_NOT_Permission;
    }
    where.advertiserId = advertiserId; //过滤广告主

    if (materialname) {
      where.adMaterial = { name: materialname }; //素材名称
    }
    if (name) {
      where.name = name; //计划名称
    }
    const total = await this.prisma.adPlacement.count({
      where,
    });

    const adPlacements = await this.prisma.adPlacement.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        adMaterial: {
          select: {
            name: true,
            url: true,
          },
        },
        advertiser: {
          select: {
            companyName: true,
            user: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });

    const adPlacementsWithNumberID = adPlacements.map((adMaterials) => ({
      ...adMaterials,
      id: Number(adMaterials.id),
      advertiserId: Number(adMaterials.advertiserId),
      adMaterialId: Number(adMaterials.adMaterialId),
      budget: Number(adMaterials.budget),
      usedBudget: Number(adMaterials.usedBudget),
      displayCount: Number(adMaterials.displayCount),
      clickCount: Number(adMaterials.clickCount),
    }));
    console.log('adPlacementsWithNumberID', adPlacementsWithNumberID);
    return {
      data: adPlacementsWithNumberID,
      total: total,
    };
  }
  async countByAdvertiser(
    userId: bigint,
  ): Promise<{ ongoing: number; completed: number }> {
    const currentDate = new Date();
    const where: any = {};
    where.advertiserId = userId;
    where.enabled = 1;
    where.endedAt = { lte: currentDate };
    // 查询已完成计划数量
    const completedPlanCount = await this.prisma.adPlacement.count({
      where,
    });

    // 查询进行中计划数量
    const ongoingPlanCount = await this.prisma.adPlacement.count({
      where: {
        advertiserId: userId,
        enabled: 1, // 仅考虑启用的计划
        startedAt: {
          lte: currentDate, // 开始日期在当前日期之前的计划
        },
        endedAt: {
          gte: currentDate, // 结束日期在当前日期之后的计划
        },
      },
    });
    return {
      ongoing: ongoingPlanCount,
      completed: completedPlanCount,
    };
  }
  findManyByMaterialIds(ids: bigint[]) {
    return this.prisma.adPlacement.findMany({
      select: {
        id: true,
        adMaterialId: true,
        startedAt: true,
        endedAt: true,
      },
      where: {
        adMaterialId: {
          in: ids,
        },
        enabled: 1,
        endedAt: {
          gte: new Date(),
        },
      },
    });
  }
}
