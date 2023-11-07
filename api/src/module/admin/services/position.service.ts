import { HttpException, Injectable } from '@nestjs/common';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdMedia, AdPosition } from '@prisma/client';
import { PositionDto } from '../dto/position.dto';

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
      },
    });
    return positions.map((position) => ({
      id: position.id,
      name: position.name,
      type: position.type,
    }));
  }
  async findById(id: bigint) {
    const positioninfo = await this.prisma.adPosition.findFirst({
      select: {
        id: true,
        name: true,
        enabled: true,
        // 类型 1 网站 2pc 软件
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
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: position,
      total,
    };
  }

  async createPosition(positionDto: PositionDto): Promise<AdPosition> {
    try {
      const {
        id,
        name,
        enabled,
        // 类型 1 网站 2pc 软件
        type,
      } = positionDto;
      console.log('create positionDto', positionDto);
      return await this.prisma.adPosition.create({
        data: {
          id,
          name,
          enabled,
          // 类型 1 网站 2pc 软件
          type,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updatePosition(id: bigint, positionDto: PositionDto) {
    try {
      const res = await this.prisma.adPosition.update({
        where: { id },
        data: {
          id: positionDto.id,
          name: positionDto.name,
          enabled: positionDto.enabled,
          // 类型 1 网站 2pc 软件
          type: positionDto.type,
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async removePosition(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const media = await this.prisma.adPosition.findUnique({ where: { id } });

    if (!media) {
      throw AuthError.POSITION_NOT_FOUND;
    }

    // 执行删除操作
    await this.prisma.adPosition.delete({ where: { id } });

    return true;
  }
}
