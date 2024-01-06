import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class MaterialService {
  constructor(private readonly PrismaService: PrismaService) {}
  async getList(page:number,limit:number){
    const result = await this.PrismaService.adMaterial.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await this.PrismaService.adMaterial.count();
    return {
      data: result,
      total,
    };
  }
  async updateAdPageMd5(id:bigint,md5:string){
    return await this.PrismaService.adMaterial.update({
      where: {
        id,
      },
      data: {
        adPageMd5: md5,
      },
    });
  }
}
