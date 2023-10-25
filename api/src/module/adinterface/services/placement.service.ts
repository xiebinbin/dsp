import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdPlacement } from '@prisma/client';

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaClient) {}
  async findById(id: bigint): Promise<AdPlacement | null> {
    return await this.prisma.adPlacement.findFirst({
      where: {
        id,
      },
    });
  }
}
