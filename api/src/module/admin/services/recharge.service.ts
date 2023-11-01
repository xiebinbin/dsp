import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { PrismaClient, Role, Bill } from '@prisma/client';
import { RechargeDto } from '../dto/recharge.dto';

@Injectable()
export class RechargeService {
  constructor(private prisma: PrismaClient) {}
  async findByadvertiserId(advertiserId: bigint): Promise<Bill | null> {
    return await this.prisma.bill.findFirst({
      where: {
        advertiserId,
      },
    });
  }

  async findById(id: bigint): Promise<Bill | null> {
    return await this.prisma.bill.findFirst({
      where: {
        id,
      },
    });
  }

  async create(data: RechargeDto) {
    try {
      // 创建 Bill 记录
      const bill = await this.prisma.bill.create({
        data: {
          amount: data.amount,
          advertiser: {
            connect: {
              id: data.id,
            },
          },
        },
      });
      console.log('data.id,', data.id);
      const amount = await this.prisma.bill.aggregate({
        where: {
          advertiserId: data.id,
        },
        _sum: {
          amount: true,
        },
      });
      console.log('totalAmount', amount._sum.amount);
      const totalused = await this.prisma.adConsume.aggregate({
        where: {
          advertiserId: data.id,
        },
        _sum: {
          amount: true,
        },
      });
      // 获取当前 Wallet 余额
      const wallet = await this.prisma.wallet.findUnique({
        where: {
          advertiserId: data.id,
        },
      });
      // 更新 Wallet 余额
      if (wallet) {
        const newBalance = wallet.balance + data.amount;

        await this.prisma.wallet.update({
          where: {
            advertiserId: data.id,
          },
          data: {
            balance: newBalance,
            totalAmount: Number(amount._sum.amount),
            totalUsed: Number(totalused._sum.amount),
          },
        });
      }

      return bill;
    } catch (error) {
      // 处理错误
      console.error('Error creating Bill:', error);
      throw error;
    }
  }
  async getHistList(queryParams: any) {
    const { page, limit, advertiserId, orderBy, createdAt } = queryParams;
    console.log('queryParams', queryParams);
    const where: any = {};
    if (advertiserId) {
      where.advertiserId = advertiserId;
    }
    if (createdAt) {
      console.log('createdAt', createdAt);
      // 将日期字符串转换为日期对象
      const dateToSearch = new Date(createdAt);
      // 计算结束日期，这里假设查询的是指定日期的记录
      const endDate = new Date(dateToSearch.getTime() + 24 * 60 * 60 * 1000);

      where.createdAt = {
        gte: dateToSearch, // 大于或等于指定日期
        lt: endDate, // 小于指定日期的第二天
      };
    }
    console.log('where', where);
    const selectFields = {
      id: true,
      amount: true,
      advertiserId: true,
      createdAt: true,
      advertiser: {
        select: { username: true },
      },
    };
    const total = await this.prisma.bill.count({ where });
    console.log('total', total);

    const bill = await this.prisma.bill.findMany({
      where,
      select: selectFields,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });
    const billWithNumberID = bill.map((bill) => ({
      ...bill,
      id: Number(bill.id),
      advertiserId: Number(bill.advertiserId),
    }));
    console.log('total', total, 'users', billWithNumberID);
    return {
      data: billWithNumberID,
      total,
    };
  }
}
