import { Module } from '@nestjs/common';
import { AdinterfaceModule } from './module/adinterface/adinterface.module';

@Module({
  imports: [AdinterfaceModule],
})
export class AdapiModule {}
