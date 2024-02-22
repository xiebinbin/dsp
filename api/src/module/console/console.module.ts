import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../services/prisma.service';
import { UserService } from './services/user.service';
import {
  CreateRootUserCommand,
  CreateRootUserQuestions,
} from './commands/create-root-user';
import { GenerateKeyCommand } from './commands/generate-key.command';
import {
  UpdateRootUserPasswordQuestions,
  UpdateUserPasswordCommand,
} from './commands/update-user-password';
import {
  CalculateReportDailyCommand,
} from './commands/calculate-report-daily.command';
import { ReportService } from './services/report.service';
import { CalculateReportPlacementCommand } from './commands/calculate-report-placement.command';
import { GenerateAdPageCommand } from './commands/generate-ad-page.command';
import { MaterialService } from './services/material.service';
import { FileService } from './services/file.service';
import { TimeCurvePlacementByDayService } from './services/time-curve-placement-by-day.service';
import { ImportPostionCommand } from './commands/import-postion';
import { ClearAdvDataCommand, ClearAdvDataQuestion } from './commands/clear-adv-data.command';
import { AdvertiserService } from './services/advertiser.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  providers: [
    PrismaService,
    UserService,
    ConfigService,
    MaterialService,
    CreateRootUserCommand,
    CreateRootUserQuestions,
    GenerateKeyCommand,
    UpdateRootUserPasswordQuestions,
    UpdateUserPasswordCommand,
    CalculateReportDailyCommand,
    CalculateReportPlacementCommand,
    GenerateAdPageCommand,
    ReportService,
    FileService,
    TimeCurvePlacementByDayService,
    //ImportPostionCommand,

    AdvertiserService,

    ClearAdvDataQuestion,
    ClearAdvDataCommand,
  ],
})
export class ConsoleModule {}
