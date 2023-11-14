// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { ReportDto } from '../dto/report.dto';
// import { reportParam } from '../dto/reportparam.dto';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
// import { ReportplacementDto } from '../dto/reportplacement.dto';

// @Injectable()
// export class ReportPlacementService {
//   constructor(private prisma: PrismaClient) {}

//   async findMedias() {
//     const medias = await this.prisma.adMedia.findMany({
//       select: {
//         id: true,
//         name: true,
//       },
//     });
//     return medias.map((media) => ({
//       id: media.id,
//       name: media.name,
//     }));
//   }
//   async findAgents() {
//     const agents = await this.prisma.reportPlacement.groupBy({
//       by: ['agentId', 'agentName'],
//     });

//     // 然后你可以使用 agents 数组，它的类型应该是 { id: number; agentName: string }[]。

//     return agents.map((agent) => ({
//       id: Number(agent.agentId),
//       name: agent.agentName,
//     }));
//   }
//   async placements(materialId: bigint) {
//     const where: any = {};
//     if (materialId !== null) {
//       where.adMaterialId = materialId;
//     }
//     const placements = await this.prisma.reportPlacement.findMany({
//       select: { adPlacementId: true, adPlacementName: true },
//       where,
//       distinct: ['adPlacementId', 'adPlacementName'],
//     });
//     return placements.map((placement) => ({
//       id: placement.adPlacementId,
//       name: placement.adPlacementName,
//     }));
//   }
//   async getReportsPlacementByDateRange(param: reportParam) {
//     const {
//       agentId,
//       advertiserId,
//       adMaterialId,
//       startDate,
//       endDate,
//       adPlacementId,
//       advertisers,
//     } = param;
//     const formattedStartDate = dayjs(startDate).startOf('day').format(); // 将日期转换为 ISO 8601 字符串
//     const formattedEndDate = dayjs(endDate).endOf('day').format();
//     const where: any = {};
//     where.startedAt = {
//       gte: formattedStartDate, // 大于或等于 startDate
//     };
//     where.endedAt = {
//       lte: formattedEndDate, // 小于或等于 endDate
//     };

//     if (agentId !== null) {
//       where.agentId = agentId;
//     }
//     if (adPlacementId !== null) {
//       where.adPlacementId = adPlacementId;
//     }
//     if (advertiserId !== null) {
//       where.advertiserId = {
//         ...(where.advertiserId || {}),
//         equals: advertiserId,
//       };
//     }

//     if (adMaterialId !== null) {
//       where.adMaterialId = adMaterialId;
//     }
//     if (advertisers !== null && advertisers !== undefined) {
//       where.advertiserId = {
//         ...(where.advertiserId || {}),
//         in: advertisers,
//       };
//     }
//     console.log('reportplacement where : ', where);
//     const prismalog = new PrismaClient({
//       log: ['query'],
//     });

//     const reports = await this.prisma.reportPlacement.groupBy({
//       by: ['startedAt', 'endedAt'],
//       where,
//       _sum: {
//         displayCount: true,
//         clickCount: true,
//         usedBudget: true,
//       },
//       orderBy: [
//         {
//           startedAt: 'asc',
//         },
//         {
//           endedAt: 'asc',
//         },
//       ],
//     });
//     // 在获取数据后，将 startedAt 和 endedAt 拼接成新的字段
//     const formattedReports = reports.map((report) => ({
//       date: `${report.startedAt.toLocaleDateString()}-${report.endedAt.toLocaleDateString()}`,
//       displayCount: report._sum.displayCount,
//       clickCount: report._sum.clickCount,
//       usedBudget: report._sum.usedBudget,
//     }));

//     const reportSummary: ReportplacementDto[] = formattedReports.map(
//       (report) => ({
//         date: report.date,
//         displayCount: Number(report.displayCount),
//         clickCount: Number(report.clickCount),
//         usedBudget: Number(report.usedBudget),
//       }),
//     );
//     return reportSummary;
//   }
// }
