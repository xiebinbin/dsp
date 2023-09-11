// redis-cache.module.ts

import { RedisCacheService } from './services/redis-cache.service';
import { CodeService } from '../admin/services/code.service';

import { Module } from '@nestjs/common';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../admin/controllers/auth.controller';
import { UserController } from '../admin/controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<CacheModuleOptions<RedisClientOptions>> => {
        const url = config.get<string>('REDIS_URL');
        const password = config.get<string>('REDIS_PASSWORD');
        const store = await redisStore({
          url,
          password,
        });

        return {
          store,
          url,
          password,
        };
      },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [CodeService, RedisCacheService],
})
export class RedisCacheModule {}
