import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, AdUsedCount } from '@prisma/client';
import { AdUsedCountDto } from '../dto/adusedcount.dto';
import { RedisCacheService } from '../../cache/services/redis-cache.service';
@Injectable()
export class AdUsedCountService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly RedisCacheService: RedisCacheService,
  ) {}
  async increaseAdCountCache(
    key: string,
    value: AdUsedCountDto,
    seconds?: number,
  ): Promise<any> {
    const data = await this.RedisCacheService.get(key);
    console.log('data', data);
    const increment = 1;
    if (!data) {
      // console.log('increaseAdCountCache', data);
      const databaseinfo = await this.findByIds(
        value.adMaterialId,
        value.placementId,
        value.countType,
      );
      // console.log('databaseinfo', databaseinfo);
      if (databaseinfo) {
        // console.log('increaseAdCountCache databaseinfo', databaseinfo);

        value.adCount = Number(databaseinfo.adCount) + increment;
      }
      // 如果数据不存在，创建一个新的数据对象
      else {
        value.adCount = increment;
      }
    } else {
      // 如果数据存在，增加 adCount 字段的值
      // console.log('increaseAdCountCache else', data);

      value.adCount = data.adCount + value.adCount;
    }
    const redisvalue: any = {
      adMaterialId: Number(value.adMaterialId),
      placementId: Number(value.placementId),
      adCount: Number(value.adCount),
      countType: Number(value.countType),
    };
    // console.log('increaseAdCountCache', redisvalue);

    // 重新存入缓存
    await this.RedisCacheService.set(key, redisvalue, seconds);
  }
  async UpdateOrCreate(data: AdUsedCountDto): Promise<AdUsedCount> {
    // return this.prisma.adUsedCount.create({ data });

    const adMaterialId = data.adMaterialId;
    const placementId = data.placementId;
    const countType = data.countType;
    // 检查是否存在符合条件的记录
    const existingRecord = await this.prisma.adUsedCount.findFirst({
      where: {
        adMaterialId,
        placementId,
        countType,
      },
    });
    // console.log('UpdateOrCreate data: ', data);
    if (existingRecord) {
      // 如果记录已存在，执行更新操作
      return this.prisma.adUsedCount.update({
        where: {
          id: existingRecord.id, // 根据实际主键字段替换
        },
        data: {
          adCount: data.adCount,
          createdAt: existingRecord.createdAt, // 设置为原始值
        },
      });
    } else {
      // 如果记录不存在，执行插入操作
      return this.prisma.adUsedCount.create({ data });
    }
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
  async findByIds(
    adMaterialId: bigint,
    placementId: bigint,
    countType: number,
  ): Promise<AdUsedCount> {
    const adUsedCount = await this.prisma.adUsedCount.findFirst({
      where: {
        adMaterialId,
        placementId,
        countType,
      },
    });

    return adUsedCount;
  }

  async getList(): Promise<AdUsedCount[]> {
    return this.prisma.adUsedCount.findMany();
  }
}
