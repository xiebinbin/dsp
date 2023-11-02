import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';
import { CacheModule } from '@nestjs/cache-manager';

import { AdCountController } from './controllers/adcount.controller';
import { MaterialService } from './services/material.service';
import { PlacementService } from './services/placement.service';
import { AdUsedCountService } from './services/adusedcount.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AdConsumeService } from './services/adconsume.service';
import { AdvService } from './services/adv.service';
import { RedisCacheService } from '../cache/services/redis-cache.service';
import { ApiAdTask } from './task/apiad.task';
import { ScheduleModule } from '@nestjs/schedule';
import { AdReportByDayService } from './services/adreportbyday.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register(),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [AdCountController],
  providers: [
    ConfigService,
    PrismaClient,
    MaterialService,
    PlacementService,
    AdUsedCountService,
    AdConsumeService,
    RedisCacheService,
    ApiAdTask,
    AdvService,
    AdReportByDayService,
  ],
})
export class AdinterfaceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/ad/*',
      method: RequestMethod.ALL,
    });
  }
}
