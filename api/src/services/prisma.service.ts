import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { env } from 'process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    console.log(process.env)
    await this.$connect();
  }
}
