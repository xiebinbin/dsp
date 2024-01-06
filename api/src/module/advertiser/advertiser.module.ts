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
import { AdSpecController } from './controllers/adspec.controller';
import { AdSpecService } from './services/adspec.service';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { PositionService } from './services/position.service';
import { PositionController } from './controllers/position.controller';
import { AdController } from './controllers/ad.controller';
import { TimeCurvePlacementByDayService } from './services/time-curve-placement-by-day.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register(),
    HttpModule,
  ],
  controllers: [
    AdController,
    AuthController,
    DashboardController,
    MaterialController,
    PlacementController,
    ReportController,
    AdSpecController,
    MediaController,
    PositionController,
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
    AdSpecService,
    MediaService,
    PositionService,
    TimeCurvePlacementByDayService,
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
