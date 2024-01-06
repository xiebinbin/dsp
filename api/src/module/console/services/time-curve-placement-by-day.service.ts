import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import dayjs from 'dayjs';
@Injectable()
export class TimeCurvePlacementByDayService {
  constructor(private readonly PrismaService: PrismaService) {}
  async getInfo(placementId: bigint,date:string){
    const result = await this.PrismaService.timeCurvePlacementByDay.findFirst({
        placementId,
    });
    
    console.log(result);
    return result;
  }
}
