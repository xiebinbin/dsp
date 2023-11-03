import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../services/prisma.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AdvertiserService } from './services/advertiser.service';
import { CodeService } from './services/code.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisCacheService } from '../cache/services/redis-cache.service';
import { DashboardController } from './controllers/dashboard.controller';
import { AdMaterialService } from './services/admaterial.service';
import { PlacementService } from './services/placement.service';
import { HttpModule } from '@nestjs/axios';
import { MaterialController } from './controllers/material.controller';
import { PlacementController } from './controllers/placement.controller';
import { PrismaClient } from '@prisma/client';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { AdReportByDayService } from './services/adreportbyday.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register(),
    HttpModule,
  ],
  controllers: [
    AuthController,
    DashboardController,
    MaterialController,
    PlacementController,
    ReportController,
  ],
  providers: [
    AuthService,
    AdvertiserService,
    ConfigService,
    PrismaService,
    PrismaClient,
    CodeService,
    RedisCacheService,
    AdMaterialService,
    PlacementService,
    ReportService,
    AdReportByDayService,
  ],
})
export class AdvertiserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/advertiser/*',
      method: RequestMethod.ALL,
    });
  }
}
