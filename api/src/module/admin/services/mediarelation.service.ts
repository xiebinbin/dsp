import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
  async findMediaRelations(id: bigint) {
    const adMediaRelations = await this.prisma.adMediaRelation.findMany({
      where: {
        id,
        enabled: true,
      },
      include: {
        adMedia: {
          select: {
            name: true,
          },
        },
      },
    });

    return adMediaRelations.map((relation) => ({
      mediaId: relation.mediaId,
      mediaName: relation.adMedia.name,
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

    return {
      data: adMediaRelation,
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
  async updateMediaRelation(
    placementId: bigint,
    mediarelationDto: mediarelationDto[],
  ) {
    try {
      const createData = mediarelationDto.map((mediarelationDto) => {
        const { mediaId, placementId } = mediarelationDto;
        return {
          mediaId,
          placementId,
          enabled: true,
        };
      });
      console.log('create  mediarelationDto', mediarelationDto);

      const redel = await this.prisma.adMediaRelation.deleteMany({
        where: {
          placementId: placementId,
        },
      });

      const createdRelations = await this.prisma.adMediaRelation.createMany({
        data: createData,
      });
      console.log('createdRelations', createdRelations);
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
