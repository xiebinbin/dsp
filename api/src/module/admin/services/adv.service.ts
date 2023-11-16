import { HttpException, Injectable } from '@nestjs/common';
import { passwordHash } from 'src/utils/auth-tool';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, Advertiser } from '@prisma/client';
import { AdvDto } from '../dto/adv.dto';

@Injectable()
export class AdvService {
  constructor(private prisma: PrismaClient) {}
  async findAdvertisers(
    queryParams: any,
  ): Promise<{ id: number; name: string; agentId: number }[]> {
    const { page, limit, username, orderBy, role, userId } = queryParams;
    const where: any = {};

    if (role != 'Root' && role != 'Operator' && userId) {
      where.userId = userId;
    }
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
  async findByOperator(id: bigint) {
    const where: any = {};
    if (id) {
      where.operatorId = id;
    }
    return await this.prisma.advertiser.findMany({
      where,
      select: { id: true, user: { select: { id: true, nickname: true } } },
    });
  }
  async findByUsername(username: string): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        username,
      },
    });
  }

  async findById(id: bigint) {
    console.log('id', id);
    const advinfo = await this.prisma.advertiser.findFirst({
      select: {
        id: true,
        username: true,
        companyName: true,
        domainName: true,
        password: true,
        userId: true,
        operatorId: true,
        updatedAt: true,
        enabled: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        operator: {
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
      domainName: boolean;
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
    const { page, limit, username, orderBy, role, userId, comp } = queryParams;
    let selectFields: MyType = {
      id: true,
      companyName: true,
      username: true,
      domainName: true,
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
    if (comp) {
      where.companyName = {
        contains: comp, // 使用 contains 进行模糊查询
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
    return {
      data: advertisers,
      total,
    };
  }
  async countByAdv(userId: bigint) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    return await this.prisma.advertiser.count({ where });
  }
  async createUser(advDto: AdvDto): Promise<Advertiser> {
    try {
      advDto.password = await passwordHash(advDto.password);
      const {
        companyName,
        username,
        password,
        enabled,
        domainName,
        userId,
      } = advDto;

      return await this.prisma.advertiser.create({
        data: {
          companyName,
          username,
          domainName,
          password,
          userId,
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
          domainName: advDto.domainName,
          password: advDto.password,
          userId: advDto.userId,
          operatorId: advDto.operatorId,
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
