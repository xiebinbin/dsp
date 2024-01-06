import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class TimeCurvePlacementByDayService {
  constructor(private readonly PrismaService: PrismaService) {}
  async getInfo(placementId:bigint,date:string){
    const result = await this.PrismaService.timeCurvePlacementByDay.findFirst({
        date,
        placementId,
    });
    return result;
  }
}
