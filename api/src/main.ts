import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './module/admin/interceptors/GlobalErrorFilter';
import { AdvModule } from './adv.module';
process.env.TZ = 'Asia/Shanghai';

import { AdvGlobalErrorFilter } from './module/advertiser/interceptors/adv-GlobalErrorFilter';
import { AdapiModule } from './adapi.module';
import { AdapiGlobalErrorFilter } from './module/adinterface/interceptors/adapi-GlobalErrorFilter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};
async function bootstrap() {
  //管理员平台
  const app = await NestFactory.create(AppModule);
  // const prisma = new PrismaClient({
  //   log: ['query'], // 启用查询日志
  // });
  app.useGlobalFilters(new GlobalErrorFilter()); // 使用全局异常过滤器
  await app.listen(4000, '0.0.0.0');
  //广告主平台
  const adv = await NestFactory.create<NestExpressApplication>(AdvModule);
  adv.useGlobalFilters(new AdvGlobalErrorFilter()); // 使用全局异常过滤器
  adv.useStaticAssets(join(__dirname, '..', 'public'));
  adv.setBaseViewsDir(join(__dirname, '..', 'views'));
  adv.setViewEngine('hbs');

  await adv.listen(4002, '0.0.0.0');
  //对外接口
  const adapi = await NestFactory.create(AdapiModule);
  adapi.useGlobalFilters(new AdapiGlobalErrorFilter()); // 使用全局异常过滤器

  await adapi.listen(4003, '0.0.0.0');
}
bootstrap();
