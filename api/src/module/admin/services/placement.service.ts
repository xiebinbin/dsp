import { HttpException, Injectable } from '@nestjs/common';
import { AuthError } from 'src/utils/err_types';
import { AdPlacement } from '@prisma/client';
import { PlacementDto } from '../dto/placement.dto';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from 'src/services/prisma.service';
import * as fs from 'fs';
import dayjs from 'dayjs';
interface ConvertedData {
  placementId: number;
  timerange: { range: string[] }[];
}
@Injectable()
export class PlacementService {
  constructor(private prisma: PrismaService,) {}
  // private filePath: string = path.join(
  //   __dirname,
  //   '..',
  //   'savejson',
  //   'placementtimerange.json',
  // ); //生产路径 多了个dist。 dist/module/admin/savejson/placementtimerange.json
  private filePath =
    '/Users/a/Documents/git/github/dsp/api/src/module/admin/savejson/placementtimerange.json'; //测试路径
  async findByname(name: string): Promise<AdPlacement | null> {
    return await this.prisma.adPlacement.findFirst({
      where: {
        name,
      },
    });
  }
  async findByAdv(advs: bigint[]) {
    return await this.prisma.adPlacement.findMany({
      where: { advertiserId: { in: advs } },
      select: { id: true },
    });
  }
  async findById(id: bigint) {
    const Placementinfo = await this.prisma.adPlacement.findFirst({
      select: {
        id: true,
        name: true,
        enabled: true,
        adMaterialId: true,
        adMaterial: {
          select: {
            name: true,
            url: true,
          },
        },
        cpmPrice: true,
        mediaType: true,
        advertiserId: true,
        budget: true,
        usedBudget: true,
        displayCount: true,
        clickCount: true,
        startedAt: true,
        endedAt: true,
        advertiser: {
          select: {
            id: true,
            companyName: true,
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        adMediaRelations: {
          select: {
            mediaId: true,
            adMedia: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: {
        id,
      },
    });

    return Placementinfo;
  }
  async getList(queryParams: any) {
    const {
      page,
      limit,
      name,
      orderBy,
      role,
      advertiserId,
      userId,
      materialname,
    } = queryParams;
    const where: any = {};
    if (role != 'Root' && userId) {
      if (userId) {
        where.advertiser = {
          userId: userId, // 过滤特定代理商的广告素材
        };
      }
    }
    if (materialname) {
      where.adMaterial = { name: materialname }; //素材名称
    }
    if (name) {
      where.name = name; //计划名称
    }
    if (advertiserId) {
      where.advertiserId = advertiserId; //过滤广告主
    }
    const total = await this.prisma.adPlacement.count({
      where,
    });

    const adPlacements = await this.prisma.adPlacement.findMany({
      where,
      //   select: selectFields,
      orderBy: orderBy ?? {
        started_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        adMaterial: {
          select: {
            name: true,
            url: true,
          },
        },
        advertiser: {
          select: {
            companyName: true,
            user: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });
    return {
      data: adPlacements,
      total: total,
    };
  }

  async createPlacement(placementDto: PlacementDto): Promise<AdPlacement> {
    try {
      const {
        name,
        enabled,
        adMaterialId,
        budget,
        mediaType,
        startedAt,
        endedAt,
        usedBudget,
        displayCount,
        clickCount,
        advertiserId,
        cpmPrice,
      } = placementDto;
      console.log('create  placementDto', placementDto);

      const placementcreate = await this.prisma.adPlacement.create({
        data: {
          name,
          enabled,
          adMaterialId,
          budget,
          mediaType,
          startedAt: utcToZonedTime(startedAt, 'Asia/Shanghai'),
          endedAt: utcToZonedTime(endedAt, 'Asia/Shanghai'),
          usedBudget,
          displayCount,
          clickCount,
          advertiserId,
          cpmPrice,
        },
      });
      if (placementDto.timerange && placementDto.timerange.length > 0) {
        const filteredTimerange = placementDto.timerange.filter(
          (item) => Object.keys(item).length > 0,
        );
        if (filteredTimerange.length > 0) {
          const convertedData: ConvertedData = {
            placementId: Number(placementcreate.id),
            timerange: filteredTimerange.map(({ range }) => ({
              range: range.map((date) => dayjs(date).format()),
            })),
          };
          console.log('convertedData ', convertedData);

          const savejson = await this.updateOrAddPlacementData(
            convertedData,
            convertedData.placementId,
          );
        }
      }
      return placementcreate;
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updatePlacement(id: bigint, PlacementDto: PlacementDto) {
    try {
      console.log('PlacementDtox', PlacementDto);
      if (PlacementDto.timerange && PlacementDto.timerange.length > 0) {
        const filteredTimerange = PlacementDto.timerange.filter(
          (item) => Object.keys(item).length > 0,
        );
        if (filteredTimerange.length > 0) {
          const convertedData: ConvertedData = {
            placementId: Number(id),
            timerange: filteredTimerange.map(({ range }) => ({
              range: range.map((date) => dayjs(date).format()),
            })),
          };
          console.log('convertedData ', convertedData);

          const savejson = await this.updateOrAddPlacementData(
            convertedData,
            convertedData.placementId,
          );
        }
      }

      // const json = JSON.stringify(convertedData);
      // console.log('json ', json);

      const res = await this.prisma.adPlacement.update({
        where: { id },
        data: {
          enabled: PlacementDto.enabled,
          adMaterialId: PlacementDto.adMaterialId,
          budget: PlacementDto.budget,
          mediaType: PlacementDto.mediaType,
          startedAt: PlacementDto.startedAt,
          endedAt: PlacementDto.endedAt,
          usedBudget: PlacementDto.usedBudget,
          displayCount: PlacementDto.displayCount,
          clickCount: PlacementDto.clickCount,
          advertiserId: PlacementDto.advertiserId,
          name: PlacementDto.name,
          updatedAt: new Date(),
          cpmPrice: PlacementDto.cpmPrice,
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async updateEnabled(id: bigint, enabled: number) {
    try {
      const res = await this.prisma.adPlacement.update({
        where: { id },
        data: {
          enabled: enabled,
          updatedAt: new Date(),
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async removePlacement(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const user = await this.prisma.adPlacement.findUnique({ where: { id } });

    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }
    console.log('removePlacement user', user);
    await this.prisma.adMediaRelation.deleteMany({
      where: { placementId: user.id },
    });
    // 执行删除操作
    await this.prisma.adPlacement.delete({ where: { id: user.id } });

    return true;
  }
  async countByAgent(
    userId: number,
  ): Promise<{ ongoing: number; completed: number }> {
    const currentDate = new Date();
    const wherecompleted: any = {};
    if (userId) {
      wherecompleted.advertiser = { userId: userId };
    }
    wherecompleted.enabled = 1;
    wherecompleted.endedAt = {
      lte: currentDate, // 结束日期在当前日期之前的计划
    };
    // 查询已完成计划数量
    const completedPlanCount = await this.prisma.adPlacement.count({
      where: wherecompleted,
    });
    const whereongoing: any = {};
    whereongoing.enabled = 1;
    whereongoing.startedAt = {
      lte: currentDate,
    };
    whereongoing.endedAt = {
      gte: currentDate, // 结束日期在当前日期之后的计划
    };
    // 查询进行中计划数量
    const ongoingPlanCount = await this.prisma.adPlacement.count({
      where: whereongoing,
    });

    console.log('已完成计划数量:', completedPlanCount);
    console.log('进行中计划数量:', ongoingPlanCount);
    return {
      ongoing: ongoingPlanCount,
      completed: completedPlanCount,
    };
  }
  async placementTimeRange(placementId: number): Promise<any> {
    const data = await this.readJsonData();
    const jsonData = data.filter((item: any) => {
      const parsedItem = JSON.parse(item);
      return parsedItem.placementId === placementId;
    });
    console.log('jsonData', jsonData);
    return jsonData;
  }
  // 读取 JSON 文件内容

  async readJsonData(): Promise<any> {
    try {
      const jsonData = await fs.promises.readFile(this.filePath, 'utf8');
      console.log('readJsonData jsonData', jsonData);
      return JSON.parse(jsonData) || []; // 如果jsonData为null，则返回空数组
    } catch (error) {
      console.error('Error reading JSON data:', error);
      return []; // 或者根据实际需求返回其他默认值
    }
  }

  // 写入 JSON 文件内容
  async writeJsonData(data: any): Promise<void> {
    const jsonData = JSON.stringify(data);
    console.log('writejson', jsonData);
    await fs.promises.writeFile(this.filePath, jsonData, 'utf8');
  }

  // 更新或添加数据项
  async updateOrAddPlacementData(
    convertedData: ConvertedData,
    placementId: number,
  ): Promise<void> {
    let data = await this.readJsonData();
    console.log('data', data);

    if (data && data.length > 0) {
      data = data.reduce((accumulator: any[], item: any) => {
        const parsedItem = JSON.parse(item);
        if (Number(parsedItem.placementId) === placementId) {
          return accumulator;
        } else {
          accumulator.push(item);
          return accumulator;
        }
      }, []);
    }

    // 添加操作
    console.log('updateOrAddPlacementData convertedData', convertedData);
    data.push(JSON.stringify(convertedData));

    console.log('updateOrAddPlacementData data', data);
    await this.writeJsonData(data);
  }
}
