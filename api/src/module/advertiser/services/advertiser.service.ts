import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Advertiser } from '@prisma/client';

@Injectable()
export class AdvertiserService {
  constructor(private readonly prisma: PrismaService) {}
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
}
