import { Injectable } from '@nestjs/common';
import { Advertiser, PrismaClient } from '@prisma/client';

@Injectable()
export class AdvertiserService {
  constructor(private readonly prisma: PrismaClient) {}
  async findByUsername(username: string): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        username,
      },
    });
  }
  async findById(id: bigint): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        id,
      },
    });
  }
  async walletById(id: bigint) {
    return await this.prisma.advertiser.findFirst({
      select: {
        id: true,
        username: true,
        wallet: {
          select: {
            balance: true,
          },
        },
      },
      where: {
        id,
      },
    });
  }
}
