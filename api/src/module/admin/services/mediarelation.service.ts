import { HttpException, Injectable, Res } from '@nestjs/common';

import { AuthError } from 'src/utils/err_types';
import { PrismaClient, AdMedia, AdMediaRelation } from '@prisma/client';
import { userInfo } from 'os';
import { MaterialDto } from '../dto/material.dto';
import { mediaDto } from '../dto/media.dto';
import { mediarelationDto } from '../dto/mediarelation.dto';

@Injectable()
export class MediaRelationService {
  constructor(private prisma: PrismaClient) {}
  async findByMediaId(mediaId: bigint) {
    return await this.prisma.adMediaRelation.findFirst({
      where: {
        mediaId,
        enabled: true,
      },
    });
  }
  async findByPlacementId(placementId: bigint) {
    return await this.prisma.adMediaRelation.findFirst({
      where: {
        placementId,
        enabled: true,
      },
    });
  }
  async findMediaRelations(
    id: bigint,
  ): Promise<{ mediaId: number; mediaName: string }[]> {
    const adMediaRelations = await this.prisma.adMediaRelation.findMany({
      where: {
        id,
        enabled: true,
      },
      include: {
        admedia: {
          select: {
            name: true,
          },
        },
      },
    });

    return adMediaRelations.map((relation) => ({
      mediaId: Number(relation.mediaId),
      mediaName: relation.admedia.name,
    }));
  }
  async findById(id: bigint) {
    const mediainfo = await this.prisma.adMediaRelation.findFirst({
      select: {
        id: true,
        mediaId: true,
        placementId: true,
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
    const total = await this.prisma.adMediaRelation.count({
      where,
    });

    const adMediaRelation = await this.prisma.adMediaRelation.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const adMediaRelationWithNumberID = adMediaRelation.map((adMedia) => ({
      ...adMedia,
      id: Number(adMedia.id),
      mediaId: Number(adMedia.mediaId),
      placementId: adMedia.placementId,
    }));
    console.log('adMediaRelationWithNumberID', adMediaRelationWithNumberID);
    return {
      data: adMediaRelationWithNumberID,
      total,
    };
  }

  async createMediaRelation(mediarelationDtos: mediarelationDto[]) {
    try {
      const createData = mediarelationDtos.map((mediarelationDto) => {
        const { mediaId, placementId } = mediarelationDto;
        return {
          mediaId,
          placementId,
          enabled: true,
        };
      });
      console.log('create  mediarelationDto', mediarelationDto);
      const createdRelations = await this.prisma.adMediaRelation.createMany({
        data: createData,
      });

      return createdRelations;
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updateMaterial(id: bigint, mediarelationDto: mediarelationDto) {
    try {
      const res = await this.prisma.adMediaRelation.update({
        where: { id },
        data: {
          enabled: mediarelationDto.enabled,
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  //   async removeUser(id: bigint): Promise<boolean> {
  //     // 查询要删除的用户
  //     const media = await this.prisma.adMedia.findUnique({ where: { id } });

  //     if (!media) {
  //       throw AuthError.MEDIA_NOT_FOUND;
  //     }

  //     // 执行删除操作
  //     await this.prisma.adMedia.delete({ where: { id } });

  //     return true;
  //   }
}
