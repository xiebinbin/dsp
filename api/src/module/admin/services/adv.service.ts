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
  async findByUsername(username: string): Promise<Advertiser | null> {
    return await this.prisma.advertiser.findFirst({
      where: {
        username,
      },
    });
  }

  async findById(id: bigint) {
    const Advinfo = await this.prisma.advertiser.findFirst({
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
        // 其他 Advertiser 模型的字段...
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
    console.log('Advinfo', Advinfo);
    return Advinfo;
  }
  async getList(queryParams: any) {
    const { page, limit, username, orderBy, role } = queryParams;
    const selectFields = {
      id: true,
      companyName: true,
      username: true,
      taxNumber: true,
      cpmPrice: true,
      createdAt: true,
      updatedAt: true,
      enabled: true,
      userId: true,
      wallet: {
        select: {
          balance: true,
        },
      },
    };
    const where: any = {};

    if (username) {
      where.username = username;
    }
    const total = await this.prisma.advertiser.count({ where });

    const advertiser = await this.prisma.advertiser.findMany({
      where,
      select: selectFields,

      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });

    const advertiserWithNumberID = advertiser.map((advertiser) => ({
      ...advertiser,
      id: Number(advertiser.id),
      userId: Number(advertiser.userId),
    }));

    return {
      data: advertiserWithNumberID,
      total,
    };
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
    if (advDto.password && advDto.password != '......') {
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

    // 执行删除操作
    await this.prisma.advertiser.delete({ where: { id } });

    return true;
  }
}
