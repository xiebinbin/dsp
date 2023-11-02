import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  private client: any;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * @Description: 设置获取redis缓存中的值
   * @param key {String}
   */
  public async get(key: string): Promise<any> {
    const data: string = await this.cacheManager.get<string>(key);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }
  public async findCacheKeysWithPrefix(prefix: string): Promise<string[]> {
    const allCacheKeys = await this.cacheManager.store.keys();
    const filteredKeys = allCacheKeys.filter((key) => key.startsWith(prefix));
    return filteredKeys;
  }

  public async findClickCacheKeys(): Promise<string[]> {
    return this.findCacheKeysWithPrefix('click:');
  }

  public async findImpressionCacheKeys(): Promise<string[]> {
    return this.findCacheKeysWithPrefix('impression:');
  }

  public async findRechargeCacheKeys(): Promise<string[]> {
    return this.findCacheKeysWithPrefix('recharge:');
  }
  public async findReportCacheKeys(date: string): Promise<string[]> {
    return this.findCacheKeysWithPrefix(`byday:${date}:`);
  }
  async getHello(): Promise<string> {
    let value: string = await this.cacheManager.get<string>('hello');
    if (!value) {
      value = `${new Date().toISOString()}`;
      await this.cacheManager.set('hello', value);
    }
    return value;
  }
  public async set(key: string, value: any, seconds?: number): Promise<any> {
    value = JSON.stringify(value);

    if (!seconds) {
      await this.cacheManager.set(key, value);
    } else {
      await this.cacheManager.set(key, value, seconds);
    }
  }
  public async del(key: string): Promise<any> {
    await this.cacheManager.del(key);
  }
}
