import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import {
  PrismaClient,
  Role,
  Advertiser,
  AdMaterial,
  AdPlacement,
  AdMedia,
} from '@prisma/client';
import { userInfo } from 'os';
import { MaterialDto } from '../dto/material.dto';
import { mediaDto } from '../dto/media.dto';
import { PlacementDto } from '../dto/placement.dto';

@Injectable()
export class PlacementService {
  constructor(private prisma: PrismaClient) {}
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
    if (role != 'Root' && userId) {
      if (userId) {
        where.advertiser = {
          userId: userId, // 过滤特定代理商的广告素材
        };
      }
    }
    if (materialname) {
      where.adMaterial = { name: materialname }; //素材名称
    }
    if (name) {
      where.name = name; //计划名称
    }
    if (advertiserId) {
      where.advertiserId = advertiserId; //过滤广告主
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

  async createPlacement(placementDto: PlacementDto): Promise<AdPlacement> {
    try {
      const {
        name,
        enabled,
        adMaterialId,
        budget,
        mediaType,
        startedAt,
        endedAt,
        usedBudget,
        displayCount,
        clickCount,
        advertiserId,
      } = placementDto;
      console.log('create  placementDto', placementDto);
      return await this.prisma.adPlacement.create({
        data: {
          name,
          enabled,
          adMaterialId,
          budget,
          mediaType,
          startedAt,
          endedAt,
          usedBudget,
          displayCount,
          clickCount,
          advertiserId,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updatePlacement(id: bigint, PlacementDto: PlacementDto) {
    try {
      const res = await this.prisma.adPlacement.update({
        where: { id },
        data: {
          enabled: PlacementDto.enabled,
          adMaterialId: PlacementDto.adMaterialId,
          budget: PlacementDto.budget,
          mediaType: PlacementDto.mediaType,
          startedAt: PlacementDto.startedAt,
          endedAt: PlacementDto.endedAt,
          usedBudget: PlacementDto.usedBudget,
          displayCount: PlacementDto.displayCount,
          clickCount: PlacementDto.clickCount,
          advertiserId: PlacementDto.advertiserId,
          updatedAt: new Date(),
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async updateEnabled(id: bigint, enabled: number) {
    try {
      const res = await this.prisma.adPlacement.update({
        where: { id },
        data: {
          enabled: enabled,
          updatedAt: new Date(),
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async removePlacement(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const user = await this.prisma.adPlacement.findUnique({ where: { id } });

    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }
    console.log('removePlacement user', user);
    await this.prisma.adMediaRelation.deleteMany({
      where: { placementId: user.id },
    });
    // 执行删除操作
    await this.prisma.adPlacement.delete({ where: { id: user.id } });

    return true;
  }
  async countByAgent(
    userId: number,
  ): Promise<{ ongoing: number; completed: number }> {
    const currentDate = new Date();
    const where: any = {};
    if (userId) {
      where.advertiser = { userId: userId };
    }
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

    console.log('已完成计划数量:', completedPlanCount);
    console.log('进行中计划数量:', ongoingPlanCount);
    return {
      ongoing: ongoingPlanCount,
      completed: completedPlanCount,
    };
  }
}
