import { Injectable } from '@nestjs/common';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AdMaterialService {
  constructor(private readonly prisma: PrismaClient) {}

  async countByAdvertiser(userId: bigint): Promise<number> {
    const where: any = {};

    where.advertiserId = userId;

    where.enabled = true;
    const total = await this.prisma.adMaterial.count({ where });
    return total;
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
    const { page, limit, name, orderBy, advertiserId } = queryParams;
    const where: any = {};

    if (name) {
      where.name = name;
    }
    if (advertiserId) {
      where.advertiserId = advertiserId;
    } else {
      throw AuthError.USER_NOT_Permission;
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
  async getOptList(id: bigint) {
    console.log('getOptList ');
    const adMaterials = await this.prisma.adMaterial.findMany({
      where: { advertiserId: id },
      select: { id: true, name: true },
      distinct: ['id', 'name'],
    });
    console.log('adMaterials', adMaterials);
    //   const result = await this.prisma.$queryRaw`
    //   SELECT DISTINCT
    //     id,
    //     name
    //   FROM AdMaterial
    //   WHERE advertiserId = ${id}
    // `;
    //   console.log('getOptList result', result);

    return adMaterials;
  }
}
