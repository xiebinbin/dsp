import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../services/prisma.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { CodeService } from './services/code.service';
import { RedisCacheService } from '../cache/services/redis-cache.service';

import { CacheModule } from '@nestjs/cache-manager';
import { UserController } from './controllers/user.controller';
import { PrismaClient } from '@prisma/client';
import { AdvController } from './controllers/adv.controller';
import { AdvService } from './services/adv.service';
import { RechargeController } from './controllers/recharge.controller';
import { RechargeService } from './services/recharge.service';
import { MaterialService } from './services/material.service';
import { MaterialController } from './controllers/material.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register(),
  ],
  controllers: [
    AuthController,
    UserController,
    AdvController,
    RechargeController,
    MaterialController,
  ],
  providers: [
    AuthService,
    UserService,
    ConfigService,
    PrismaService,
    CodeService,
    RedisCacheService,
    PrismaClient,
    AdvService,
    RechargeService,
    MaterialService,
  ],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/admin/*',
      method: RequestMethod.ALL,
    });
  }
}
