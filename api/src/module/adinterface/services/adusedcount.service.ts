import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, AdUsedCount } from '@prisma/client';
import { AdUsedCountDto } from '../dto/adusedcount.dto';

@Injectable()
export class AdUsedCountService {
  constructor(private readonly prisma: PrismaClient) {}

  async createAdUsedCount(data: AdUsedCountDto): Promise<AdUsedCount> {
    return this.prisma.adUsedCount.create({ data });
  }

  async updateAdUsedCount(
    id: bigint,
    data: AdUsedCountDto,
  ): Promise<AdUsedCount> {
    const existingAdUsedCount = await this.findById(id);
    return this.prisma.adUsedCount.update({ where: { id }, data });
  }

  async deleteAdUsedCount(id: bigint): Promise<AdUsedCount> {
    const existingAdUsedCount = await this.findById(id);
    return this.prisma.adUsedCount.delete({ where: { id } });
  }

  async findById(id: bigint): Promise<AdUsedCount> {
    const adUsedCount = await this.prisma.adUsedCount.findUnique({
      where: { id },
    });
    if (!adUsedCount) {
      throw new NotFoundException(`AdUsedCount with id ${id} not found`);
    }
    return adUsedCount;
  }

  async getList(): Promise<AdUsedCount[]> {
    return this.prisma.adUsedCount.findMany();
  }
}
