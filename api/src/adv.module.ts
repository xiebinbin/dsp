import { Module } from '@nestjs/common';
import { AdvertiserModule } from './module/advertiser/advertiser.module';

@Module({
  imports: [AdvertiserModule],
})
export class AdvModule {}
