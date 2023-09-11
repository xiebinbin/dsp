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
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register(),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    UserService,
    ConfigService,
    PrismaService,
    CodeService,
    RedisCacheService,
    PrismaClient,
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
