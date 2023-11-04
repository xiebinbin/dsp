import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
// import { canvas } from 'src/utils/canvas';

@Injectable()
export class CodeService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  GetCapta(id: string) {
    //随机4位验证码
    // const can = new canvas();
    // const r = new randomstr();
    // const code = JSON.stringify(r.getrandstr(4));
    // const res = this.cacheManager.set(id, code, 30 * 60 * 60);
    // console.log('res: ', ' id ', id, '--', this.cacheManager.get(id));
    // return can.drawPic(code);
  }
  // constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // async getHello(): Promise<string> {
  //   let value: string = await this.cacheManager.get<string>('hello');
  //   if (!value) {
  //     value = `${new Date().toISOString()}`;
  //     await this.cacheManager.set('hello', value);
  //   }
  //   return value;
  // }
}
