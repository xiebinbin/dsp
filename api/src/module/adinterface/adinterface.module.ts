import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaClient } from '@prisma/client';

import { AdCountController } from './controllers/adcount.controller';
import { MaterialService } from './services/material.service';
import { PlacementService } from './services/placement.service';
import { AdUsedCountService } from './services/adusedcount.service';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    HttpModule,
  ],
  controllers: [AdCountController],
  providers: [
    ConfigService,
    PrismaClient,
    MaterialService,
    PlacementService,
    AdUsedCountService,
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
