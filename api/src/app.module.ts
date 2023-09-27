import { Module } from '@nestjs/common';
import { AdminModule } from './module/admin/admin.module';

@Module({
  imports: [AdminModule],
})
export class AppModule {}
