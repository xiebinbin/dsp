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
  async findMedias() {
    const medias = await this.prisma.adMedia.findMany({
      select: {
        id: true,
        name: true, // 假设代理商有一个用户名字段，你可以根据实际情况选择需要的字段
      },
    });
    return medias.map((agent) => ({
      id: agent.id,
      name: agent.name, // 这里假设代理商的用户名字段为 username
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

  async createMaterial(mediaDto: mediaDto): Promise<AdMedia> {
    try {
      const {
        id,
        name,
        enabled,
        // 类型 1 网站 2pc 软件
        type,
        url,
      } = mediaDto;
      console.log('createMaterial mediaDto', mediaDto);
      return await this.prisma.adMedia.create({
        data: {
          id,
          name,
          enabled,
          // 类型 1 网站 2pc 软件
          type,
          url,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updateMaterial(id: bigint, mediaDto: mediaDto) {
    try {
      const res = await this.prisma.adMedia.update({
        where: { id },
        data: {
          id: mediaDto.id,
          name: mediaDto.name,
          enabled: mediaDto.enabled,
          // 类型 1 网站 2pc 软件
          type: mediaDto.type,
          url: mediaDto.url,
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async removeUser(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const media = await this.prisma.adMedia.findUnique({ where: { id } });

    if (!media) {
      throw AuthError.MEDIA_NOT_FOUND;
    }

    // 执行删除操作
    await this.prisma.adMedia.delete({ where: { id } });

    return true;
  }
}
