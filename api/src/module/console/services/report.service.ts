import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { ReportDailyDto } from '../commands/dto/reportdaily.dto';

@Injectable()
export class ReportService {
  constructor(private readonly PrismaService: PrismaService) {}
  async executeQuery(date: string) {
    try {
      const inputdate = new Date(date);
      // await this.PrismaService
      //   .$executeRaw`DELETE FROM report_daily WHERE date  >= ${date}`;
      await this.PrismaService.reportDaily.deleteMany({
        where: {
          date: {
            gte: inputdate, // 删除指定日期及之后的数据
          },
        },
      });
      const result: ReportDailyDto[] = await this.PrismaService.$queryRaw`
        SELECT
          a.date as date,
          c.user_id as agentId,
          e.username AS agentName,
          b.advertiser_id as advertiserId,
          c.company_name as advertiserName, 
          b.ad_material_id as adMaterialId,
          d.name AS adMaterialName,
          a.placement_id as adPlacementId,
          b.name AS adPlacementName,
          SUM(a.display_count) AS displayCount,
          SUM(a.click_count) AS clickCount,
          SUM(a.used_budget) AS usedBudget
        FROM
        ad_report_by_day a
        LEFT JOIN
          ad_placements b
        ON
          a.placement_id = b.id
        LEFT JOIN
        advertisers c
        ON
          b.advertiser_id = c.id
        LEFT JOIN
          ad_materials d
        ON
          b.ad_material_id = d.id
        LEFT JOIN (
          SELECT
            id,
            username
          FROM
            users
          WHERE
            role = 'Agent'
        ) e
        ON
          c.user_id = e.id
          WHERE a.date >=${inputdate}
        GROUP BY
          a.date,
          a.placement_id,
          b.name,
          b.advertiser_id,
          c.company_name,
          b.ad_material_id,
          d.name,
          c.user_id,
          e.username
      `;
      console.log('result', result);
      if (result) {
        for (const row of result) {
          // 插入数据到 AdReportByDay 表中
          console.log('row', row);
          await this.PrismaService.reportDaily.create({
            data: {
              date: row.date,
              agentId: row.agentId,
              agentName: row.agentName,
              advertiserId: row.advertiserId,
              advertiserName: row.advertiserName,
              adMaterialId: row.adMaterialId,
              adMaterialName: row.adMaterialName,
              adPlacementId: row.adPlacementId,
              adPlacementName: row.adPlacementName,
              displayCount: BigInt(row.displayCount),
              clickCount: BigInt(row.clickCount),
              usedBudget: BigInt(row.usedBudget),
            },
          });
        }
      }

      return 'ok';
    } catch (error) {
      throw new Error(error);
    }
  }
}
