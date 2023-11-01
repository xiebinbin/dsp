import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { passwordHash } from 'src/utils/auth-tool';
import { AuthError } from 'src/utils/err_types';
import { PrismaClient, Role, Advertiser } from '@prisma/client';
import { userInfo } from 'os';

@Injectable()
export class AdvService {
  constructor(private prisma: PrismaClient) {}

  async findById(id: bigint) {
    const advinfo = await this.prisma.advertiser.findFirst({
      select: {
        id: true,
        // username: true,
        // companyName: true,
        // taxNumber: true,
        // password: true,
        cpmPrice: true,
        // userId: true,
        // updatedAt: true,
        // enabled: true,
        // user: {
        //   select: {
        //     id: true,
        //     nickname: true,
        //   },
        // },
        // wallet: {
        //   select: {
        //     balance: true,
        //   },
        // },
      },
      where: {
        id,
      },
    });
    console.log('Advinfo', advinfo);

    return advinfo;
  }
  async deductBalance(advertiserId: bigint): Promise<void> {
    const advertiser = await this.prisma.advertiser.findUnique({
      where: { id: advertiserId },
      include: { wallet: true },
    });

    if (!advertiser) {
      throw new NotFoundException('Advertiser not found');
    }

    const { wallet } = advertiser;

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const totalamount = await this.prisma.bill.aggregate({
      where: {
        advertiserId: advertiserId,
      },
      _sum: {
        amount: true,
      },
    });
    //总金额
    console.log('totalamount', totalamount);
    //总消耗
    const totalused = await this.prisma.adConsume.aggregate({
      where: {
        advertiserId: advertiserId,
      },
      _sum: {
        amount: true,
      },
    });
    console.log('消耗', Number(totalused._sum.amount));

    console.log(
      '余额',
      totalamount._sum.amount - Number(totalused._sum.amount),
    );
    const bal = Number(totalamount._sum.amount) - Number(totalused._sum.amount);
    // 扣除余额
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: Number(bal),
        totalUsed: Number(totalused._sum.amount),
      },
    });
  }
}
