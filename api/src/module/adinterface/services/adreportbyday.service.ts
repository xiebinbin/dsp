import { Injectable } from '@nestjs/common';
import { PrismaClient, AdReportByDay } from '@prisma/client';
import { AdReportByDayDto } from '../dto/adreportbyday.dto';
import { RedisCacheService } from '../../cache/services/redis-cache.service';

@Injectable()
export class AdReportByDayService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly RedisCacheService: RedisCacheService,
  ) {}

  async increaseAdReportByDayCache(
    key: string,
    value: AdReportByDayDto,
    seconds?: number,
  ): Promise<any> {
    const data = await this.RedisCacheService.get(key);
    if (!data) {
      //如果缓存数据没有，查询数据库
      const databaseinfo = await this.findById(
        BigInt(value.placementId),
        value.date,
      );
      // console.log('increaseAdConsumeCache', databaseinfo);
      if (databaseinfo) {
        //如果数据库有数值，用数据库
        // console.log('increaseAdConsumeCache', databaseinfo);

        value.usedBudget = value.usedBudget + Number(databaseinfo.usedBudget);
        value.displayCount =
          value.displayCount + Number(databaseinfo.displayCount);
        value.clickCount = value.clickCount + Number(databaseinfo.clickCount);
      }
    } else {
      // 如果缓存数据存在，增加 adCount 字段的值
      value.usedBudget = value.usedBudget + Number(data.usedBudget);
      value.displayCount = value.displayCount + Number(data.displayCount);
      value.clickCount = value.clickCount + Number(data.clickCount);
    }
    const redisvalue: AdReportByDayDto = {
      date: value.date,
      placementId: Number(value.placementId),
      usedBudget: Number(value.usedBudget),
      displayCount: Number(value.displayCount),
      clickCount: Number(value.clickCount),
    };
    // console.log('increaseAdConsumeCache value', redisvalue);

    // 重新存入缓存
    await this.RedisCacheService.set(key, redisvalue, seconds);
  }
  async UpdateOrCreate(data: AdReportByDayDto): Promise<AdReportByDay> {
    const date = data.date;
    const placementId = data.placementId;
    const usedBudget = data.usedBudget;
    const displayCount = data.displayCount;
    const clickCount = data.clickCount;
    // 检查是否存在符合条件的记录
    const existingRecord = await this.prisma.adReportByDay.findFirst({
      where: {
        placementId,
        date,
      },
    });

    if (existingRecord) {
      // 如果记录已存在，执行更新操作
      return this.prisma.adReportByDay.update({
        where: {
          id: existingRecord.id, // 根据实际主键字段替换
        },
        data: {
          usedBudget,
          displayCount,
          clickCount, // 设置为原始值
          createdAt: existingRecord.createdAt,
        },
      });
    } else {
      // 如果记录不存在，执行插入操作
      return this.prisma.adReportByDay.create({ data });
    }
  }
  async findById(placementId: bigint, date: string): Promise<AdReportByDay> {
    const adReportByDay = await this.prisma.adReportByDay.findFirst({
      where: {
        placementId,
        date,
      },
    });

    return adReportByDay;
  }
}
