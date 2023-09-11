import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './module/admin/interceptors/GlobalErrorFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const prisma = new PrismaClient({
  //   log: ['query'], // 启用查询日志
  // });
  app.useGlobalFilters(new GlobalErrorFilter()); // 使用全局异常过滤器

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
