import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly PrismaService: PrismaService) {}
  async executeQuery(date: string) {
    try {
      console.log('date', date);
      const result = await this.PrismaService.$queryRaw`
        SELECT
          a.date,
          a.placement_id,
          b.name AS adPlacementName,
          b.advertiser_id,
          c.company_name,
          b.ad_material_id,
          d.name AS adMaterialName,
          c.user_id,
          e.username AS agentUsername,
          SUM(a.used_budget) AS totalUsedBudget,
          SUM(a.display_count) AS totalDisplayCount,
          SUM(a.click_count) AS totalClickCount
        FROM
          ad_report_byday a
        LEFT JOIN
          ad_placements b
        ON
          a.placement_id = b.id
        LEFT JOIN
          Advertiser c
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

      return result;
    } catch (error) {
      throw new Error('An error occurred while executing the query.');
    }
  }
}
