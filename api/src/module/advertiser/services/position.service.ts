import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaClient) {}
  async findByUsername(name: string, type: number) {
    return await this.prisma.adPosition.findFirst({
      where: {
        name,
        type,
      },
    });
  }
  async findPositions() {
    const positions = await this.prisma.adPosition.findMany({
      where: { enabled: true }, // 获取可用的
      select: {
        id: true,
        name: true,
        type: true,
        adSpecId: true,
        adMediaId: true,
      },
    });
    return positions.map((position) => ({
      id: position.id,
      name: position.name,
      type: position.type,
      adSpecId: position.adSpecId,
      adMediaId: position.adMediaId,
    }));
  }
  async findById(id: bigint) {
    const positioninfo = await this.prisma.adPosition.findFirst({
      select: {
        id: true,
        name: true,
        enabled: true,
        // 类型 1 网站 2pc 软件
        adSpecId: true,
        adSpec: {
          select: {
            id: true,
            name: true,
          },
        },
        adMediaId: true,
        adMedia: {
          select: {
            id: true,
            name: true,
          },
        },
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id,
      },
    });
    console.log('positioninfo', positioninfo);
    return positioninfo;
  }
  async getList(queryParams: any) {
    const { page, limit, name, orderBy, role, type } = queryParams;
    const where: any = {};

    if (name) {
      where.name = name;
    }
    const total = await this.prisma.adPosition.count({
      where,
    });

    const position = await this.prisma.adPosition.findMany({
      where,
      select: {
        id: true,
        name: true,
        enabled: true,
        // 类型 1 网站 2pc 软件
        adSpecId: true,
        adSpec: {
          select: {
            id: true,
            name: true,
          },
        },
        adMediaId: true,
        adMedia: {
          select: {
            id: true,
            name: true,
          },
        },
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: position,
      total,
    };
  }
}
