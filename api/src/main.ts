import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './module/admin/interceptors/GlobalErrorFilter';
import { AdvModule } from './adv.module';

import { AdvGlobalErrorFilter } from './module/advertiser/interceptors/adv-GlobalErrorFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const prisma = new PrismaClient({
  //   log: ['query'], // 启用查询日志
  // });
  app.useGlobalFilters(new GlobalErrorFilter()); // 使用全局异常过滤器

  await app.listen(3000, '0.0.0.0');

  const adv = await NestFactory.create(AdvModule);
  adv.useGlobalFilters(new AdvGlobalErrorFilter()); // 使用全局异常过滤器

  await adv.listen(3002, '0.0.0.0');
}
bootstrap();
