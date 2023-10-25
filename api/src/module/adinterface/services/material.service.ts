import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdMaterial } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaClient) {}
  async findById(id: bigint): Promise<AdMaterial | null> {
    return await this.prisma.adMaterial.findFirst({
      where: {
        id,
      },
    });
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
}
