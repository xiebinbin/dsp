import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaClient, AdConsume } from '@prisma/client';
import { AdConsumeDto } from '../dto/adconsume.dto';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Injectable()
export class AdConsumeService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly RedisCacheService: RedisCacheService,
  ) {}
  async findById(id: bigint): Promise<AdConsume | null> {
    return await this.prisma.adConsume.findFirst({
      where: {
        id,
      },
    });
  }
  async increaseAdConsumeCache(
    key: string,
    value: AdConsumeDto,
    seconds?: number,
  ): Promise<any> {
    const data = await this.RedisCacheService.get(key);
    const increment = 1;
    if (!data) {
      //如果缓存数据没有，查询数据库
      const databaseinfo = await this.findByIds(
        value.advertiserId,
        value.adMaterialId,
        value.placementId,
      );
      console.log('increaseAdConsumeCache', databaseinfo);
      if (databaseinfo) {
        //如果数据库有数值，用数据库
        console.log('increaseAdConsumeCache', databaseinfo);

        value.amount =
          (increment * value.cpmPrice) / 1000 + Number(databaseinfo.amount);
      } else {
        // 如果数据库不存在，创建一个新的数据对象
        value.amount = (increment * value.cpmPrice) / 1000;
      }
    } else {
      // 如果缓存数据存在，增加 adCount 字段的值
      value.amount = data.amount + value.amount;
    }
    const redisvalue: any = {
      advertiserId: Number(value.advertiserId),
      adMaterialId: Number(value.adMaterialId),
      placementId: Number(value.placementId),
      amount: Number(value.amount),
      cpmPrice: Number(value.cpmPrice),
    };
    console.log('increaseAdConsumeCache value', redisvalue);

    // 重新存入缓存
    await this.RedisCacheService.set(key, redisvalue, seconds);
  }
  async UpdateOrCreate(data: AdConsumeDto): Promise<AdConsume> {
    const adMaterialId = data.adMaterialId;
    const placementId = data.placementId;
    const advertiserId = data.advertiserId;
    // 检查是否存在符合条件的记录
    const existingRecord = await this.prisma.adConsume.findFirst({
      where: {
        adMaterialId,
        placementId,
        advertiserId,
      },
    });

    if (existingRecord) {
      // 如果记录已存在，执行更新操作
      return this.prisma.adConsume.update({
        where: {
          id: existingRecord.id, // 根据实际主键字段替换
        },
        data: {
          amount: data.amount,
          cpmPrice: data.cpmPrice,
          createdAt: existingRecord.createdAt, // 设置为原始值
        },
      });
    } else {
      // 如果记录不存在，执行插入操作
      return this.prisma.adConsume.create({ data });
    }
  }
  async findByIds(
    advertiserId: bigint,
    adMaterialId: bigint,
    placementId: bigint,
  ): Promise<AdConsume> {
    const adConsume = await this.prisma.adConsume.findFirst({
      where: {
        advertiserId,
        adMaterialId,
        placementId,
      },
    });

    return adConsume;
  }
}
