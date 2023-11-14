import { HttpException, Injectable } from '@nestjs/common';

import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdMedia } from '@prisma/client';
import { mediaDto } from '../dto/media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaClient) {}
  async findByUsername(name: string) {
    return await this.prisma.adMedia.findFirst({
      where: {
        name,
      },
    });
  }
  async findMedias(type?: number) {
    const where: any = {};
    if (type && type != 0) {
      console.log('findmediastype', type);
      where.type = type;
    }
    where.enabled = true;
    const medias = await this.prisma.adMedia.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
    return medias.map((agent) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
    }));
  }
  async findById(id: bigint) {
    const mediainfo = await this.prisma.adMedia.findFirst({
      select: {
        id: true,
        name: true,
        enabled: true,
        // 类型 1 网站 2pc 软件
        type: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id,
      },
    });
    console.log('mediainfo', mediainfo);
    return mediainfo;
  }
  async getList(queryParams: any) {
    const { page, limit, name, orderBy, role, type } = queryParams;
    const where: any = {};

    if (name) {
      where.name = name;
    }
    const total = await this.prisma.adMedia.count({
      where,
    });

    const adMedia = await this.prisma.adMedia.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: adMedia,
      total,
    };
  }
}
