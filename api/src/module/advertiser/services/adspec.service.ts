import { HttpException, Injectable } from '@nestjs/common';
import { AuthError } from 'src/utils/err_types';
import { AdSpec, PrismaClient } from '@prisma/client';
import { AdSpecDto } from '../dto/adspec.dto';

@Injectable()
export class AdSpecService {
  constructor(private prisma: PrismaClient) {}
  async findByUsername(name: string, type: number) {
    return await this.prisma.adSpec.findFirst({
      where: {
        name,
        type,
      },
    });
  }
  async findAdSpecs() {
    const AdSpecs = await this.prisma.adSpec.findMany({
      where: { enabled: true }, // 获取可用的
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
    return AdSpecs.map((position) => ({
      id: position.id,
      name: position.name,
      type: position.type,
    }));
  }
  async findById(id: bigint) {
    const adSpecinfo = await this.prisma.adSpec.findFirst({
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
    console.log('adSpecinfo', adSpecinfo);
    return adSpecinfo;
  }
  async getList(queryParams: any) {
    const { page, limit, name, orderBy, role, type } = queryParams;
    const where: any = {};

    if (name) {
      where.name = name;
    }
    const total = await this.prisma.adSpec.count({
      where,
    });

    const adSpec = await this.prisma.adSpec.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: adSpec,
      total,
    };
  }
}
