import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, Role, Advertiser, AdMaterial } from '@prisma/client';
import { userInfo } from 'os';
import { MaterialDto } from '../dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaClient) {}
  async findByUsername(name: string): Promise<AdMaterial | null> {
    return await this.prisma.adMaterial.findFirst({
      where: {
        name,
      },
    });
  }

  async findById(id: bigint) {
    const Materialinfo = await this.prisma.adMaterial.findFirst({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        enabled: true,
        mediaType: true,
        contentType: true,
        position: true,
        content: true,
        url: true,
        advertiserId: true,
        jumpurl: true,
        advertiser: {
          select: {
            id: true,
            companyName: true,
            taxNumber: true,
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      where: {
        id,
      },
    });
    console.log('Materialinfo', Materialinfo);
    return Materialinfo;
  }
  async getList(queryParams: any) {
    const { page, limit, name, orderBy, role, advertiserId, userId } =
      queryParams;
    const where: any = {};
    if (role != 'Root' && role != 'Operator') {
      if (userId) {
        console.log('material getlis userId', userId);
        where.advertiser = {
          userId: userId, // 过滤特定用户的广告素材
        };
      } else {
        throw AuthError.USER_NOT_Permission;
      }
    }
    if (name) {
      where.name = name;
    }
    if (advertiserId) {
      where.advertiserId = advertiserId;
    }
    const total = await this.prisma.adMaterial.count({
      where,
    });

    const adMaterials = await this.prisma.adMaterial.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
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

    const adMaterialsWithNumberID = adMaterials.map((adMaterials) => ({
      ...adMaterials,
      id: Number(adMaterials.id),
      advertiserId: Number(adMaterials.advertiserId),
    }));
    console.log('adMaterialsWithNumberID', adMaterialsWithNumberID);
    return {
      data: adMaterialsWithNumberID,
      total,
    };
  }
  async countByAgent(userId: bigint): Promise<number> {
    const where: any = {};
    if (userId) {
      where.advertiser = { userId: userId };
    }
    // where.enabled = true;
    const total = await this.prisma.adMaterial.count({ where });
    return total;
  }

  async createMaterial(materialDto: MaterialDto): Promise<AdMaterial> {
    try {
      const {
        name,
        mediaType,
        contentType,
        enabled,
        position,
        content,
        url,
        jumpurl,
        advertiserId,
      } = materialDto;
      console.log('createMaterial materialDto', materialDto);
      return await this.prisma.adMaterial.create({
        data: {
          name,
          mediaType,
          contentType,
          enabled,
          position,
          content,
          url,
          jumpurl,
          advertiserId,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updateMaterial(id: bigint, materialDto: MaterialDto) {
    try {
      const res = await this.prisma.adMaterial.update({
        where: { id },
        data: {
          name: materialDto.name,
          mediaType: materialDto.mediaType,
          contentType: materialDto.contentType,
          enabled: materialDto.enabled,
          position: materialDto.position,
          content: materialDto.content,
          url: materialDto.url,
          jumpurl: materialDto.jumpurl,
          advertiserId: materialDto.advertiserId,
          updatedAt: new Date(),
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
    const user = await this.prisma.adMaterial.findUnique({ where: { id } });

    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }

    // 执行删除操作
    await this.prisma.adMaterial.delete({ where: { id } });

    return true;
  }
}
