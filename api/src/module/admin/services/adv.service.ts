import { HttpException, Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, Role, Advertiser } from '@prisma/client';
import { AdvDto } from '../dto/adv.dto';
import { userInfo } from 'os';

@Injectable()
export class AdvService {
  constructor(private prisma: PrismaClient) {}
  async findAdvertisers(
    queryParams: any,
  ): Promise<{ id: number; name: string; agentId: number }[]> {
    const { page, limit, username, orderBy, role, userId } = queryParams;
    console.log('userId', userId, 'role', role);
    const where: any = {};

    if (role != 'Root' && role != 'Operator' && userId) {
      where.userId = userId;
    }
    console.log('where ', where);
    const advertisers = await this.prisma.advertiser.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        userId: true,
      },
    });
    const advertisersArray = advertisers.map((advertisers) => ({
      id: Number(advertisers.id),
      name: advertisers.companyName, // 这里假设代理商的用户名字段为 username
      agentId: Number(advertisers.userId),
    }));

    return advertisersArray;
  }
  async findByUsername(username: string): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        username,
      },
    });
  }

  async findById(id: bigint) {
    const advinfo = await this.prisma.advertiser.findFirst({
      select: {
        id: true,
        username: true,
        companyName: true,
        taxNumber: true,
        password: true,
        cpmPrice: true,
        userId: true,
        updatedAt: true,
        enabled: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        wallet: {
          select: {
            balance: true,
          },
        },
      },
      where: {
        id,
      },
    });
    console.log('Advinfo', advinfo);

    return advinfo;
  }
  async getList(queryParams: any) {
    type MyType = {
      id: boolean;
      companyName: boolean;
      username: boolean;
      taxNumber: boolean;
      cpmPrice: boolean;
      createdAt: boolean;
      enabled: boolean;
      updatedAt?: boolean;
      userId?: boolean;
      wallet?: {
        select: {
          balance: boolean;
        };
      };
    };
    const { page, limit, username, orderBy, role, userId } = queryParams;
    let selectFields: MyType = {
      id: true,
      companyName: true,
      username: true,
      taxNumber: true,
      cpmPrice: true,
      createdAt: true,
      updatedAt: true,
      enabled: true,
    };
    const where: any = {};

    if (role === 'Root') {
      selectFields = {
        ...selectFields,
        userId: true,
        wallet: {
          select: {
            balance: true,
          },
        },
      };
    }

    if (username) {
      where.username = username;
    }
    if (role != 'Root' && userId) {
      where.userId = userId;
    }

    const total = await this.prisma.advertiser.count({ where });

    const advertisers = await this.prisma.advertiser.findMany({
      where,
      select: selectFields,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });

    const advertisersWithNumberID = advertisers.map((advertiser) => ({
      ...advertiser,
      id: Number(advertiser.id),
      userId: role === 'Root' ? Number(advertiser.userId) : undefined,
    }));

    return {
      data: advertisersWithNumberID,
      total,
    };
  }
  async countByAdv(userId: bigint): Promise<number> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    const res = await this.prisma.advertiser.count({ where });
    return res;
  }
  async createUser(advDto: AdvDto): Promise<Advertiser> {
    try {
      advDto.password = await passwordHash(advDto.password);
      const {
        companyName,
        username,
        password,
        enabled,
        taxNumber,
        cpmPrice,
        userId,
      } = advDto;

      return await this.prisma.advertiser.create({
        data: {
          companyName,
          username,
          taxNumber,
          password,
          userId,
          cpmPrice: Number(cpmPrice),
          enabled,
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async updateUser(id: bigint, advDto: AdvDto) {
    console.log('id', id, 'updatid', advDto.id);
    if (advDto.password) {
      advDto.password = await passwordHash(advDto.password);
    } else {
      const adv = await this.prisma.advertiser.findUnique({
        where: { id },
        select: { password: true },
      });

      advDto.password = adv.password;
    }
    console.log('advdto', advDto);
    try {
      const res = await this.prisma.advertiser.update({
        where: { id },
        data: {
          companyName: advDto.companyName,
          username: advDto.username,
          taxNumber: advDto.taxNumber,
          password: advDto.password,
          userId: advDto.userId,
          cpmPrice: Number(advDto.cpmPrice),
          enabled: advDto.enabled,
          updatedAt: new Date(),
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async removeUser(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const user = await this.prisma.advertiser.findUnique({ where: { id } });

    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }
    await this.prisma.adMaterial.deleteMany({
      where: { advertiserId: user.id },
    });

    await this.prisma.wallet.deleteMany({ where: { advertiserId: user.id } });

    // 执行删除操作
    await this.prisma.advertiser.delete({ where: { id: user.id } });

    return true;
  }
}
