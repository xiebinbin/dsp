import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdPlacement } from '@prisma/client';
import { userInfo } from 'os';
import { MaterialDto } from '../dto/material.dto';
import { PlacementDto } from '../dto/placement.dto';

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
            admedia: {
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

    // 查询已完成计划数量
    const completedPlanCount = await this.prisma.adPlacement.count({
      where: {
        enabled: 1, // 仅考虑启用的计划
        endedAt: {
          lte: currentDate, // 结束日期在当前日期之前的计划
        },
      },
    });

    // 查询进行中计划数量
    const ongoingPlanCount = await this.prisma.adPlacement.count({
      where: {
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
}
