import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
@Injectable()
export class TimeCurvePlacementByDayService {
  constructor(private readonly PrismaService: PrismaService){}
  async findByIds(ids: bigint[],date: string) {
    const items = await this.PrismaService.timeCurvePlacementByDay.findMany({
      where: {
        placementId: {
          in: ids
        },
        date: new Date(date),
      }
    });
    const noExistIds = ids.filter((id) => { 
      return !items.find((item) => item.placementId === id);
    });
    if (noExistIds.length > 0) {
      const dataByDays = await this.PrismaService.adReportByDay.findMany({
        where: {
          placementId: {
            in: noExistIds
          },
          date: new Date(date),
        }
      });
      const createItems = noExistIds.map((noExistId) => {
        const item = dataByDays.find((item) => item.placementId === noExistId);
        if (!item) {
          return null;
        }
        return {
          placementId: noExistId,
          date:new Date(date),
          curveData: this.splitNorm(Number(item.displayCount), 24)
        }
      }).filter((item) => item !== null);
      await this.PrismaService.timeCurvePlacementByDay.createMany({
        data: createItems
      });
      if (createItems.length > 0) {
        const newAddItems = await this.PrismaService.timeCurvePlacementByDay.findMany({
          where: {
            placementId: {
              in: noExistIds
            }
          }
        });
        items.push(...newAddItems);
      }
    }
    console.log('items', items);
    return items;
  }
  async getInfo(placementId: bigint, date: string) {
    const result = await this.PrismaService.timeCurvePlacementByDay.findFirst({
      select: {
        placementId: true,
        date: true,
        curveData: true,
      },
      where: {
        date: new Date(date),
        placementId
      }
    });
    if (!result) {
      const dataByDay = await this.PrismaService.adReportByDay.findFirst({
        where: {
          placementId: placementId,
          date: new Date(date),
        }
      });
      if (!dataByDay) {
        return null;
      }
      return await this.PrismaService.timeCurvePlacementByDay.create({
        data: {
          placementId,
          date: new Date(date),
          curveData: this.splitNorm(Number(dataByDay.displayCount), 24)
        }
      });
    }
    return result;
  }
  splitNorm(total: number, limit: number) {
    let items = new Array<number>(limit).fill(0);

    if (total <= 0) {
      return items;
    }
    const randomStart = Math.ceil((total / limit) * 0.3);
    let avg = Math.ceil(total / limit);

    for (let i = 0; i < items.length; i++) {
      if (total <= 0) {
        break;
      }

      let val = Math.floor(Math.random() * (avg - randomStart + 1)) + randomStart;
      if (total < val) {
        val = total;
      }

      items[i] = val;
      total -= val;
    }

    while (total > 0) {
      avg = Math.ceil(total / limit);

      for (let i = 0; i < items.length; i++) {
        if (total <= 0) {
          break;
        }

        let val = avg;
        if (total < val) {
          val = total;
        }

        items[i] += val;
        total -= val;
      }
    }

    return items;
  }

}
