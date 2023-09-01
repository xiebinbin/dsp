import { Module } from '@nestjs/common';
import { AdminModule } from './module/admin/admin.module';
import { AdvertiserModule } from './module/advertiser/advertiser.module';

@Module({
  imports: [AdminModule, AdvertiserModule],
})
export class AppModule {}
