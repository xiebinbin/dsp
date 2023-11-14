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
  // CalculateReportDailyQuestions,
} from './commands/calculate-report-daily.command';
import { ReportService } from './services/report.service';
import { CalculateReportPlacementCommand } from './commands/calculate-report-placement.command';

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
    CreateRootUserCommand,
    CreateRootUserQuestions,
    GenerateKeyCommand,
    UpdateRootUserPasswordQuestions,
    UpdateUserPasswordCommand,
    CalculateReportDailyCommand,
    CalculateReportPlacementCommand,
    ReportService,
  ],
})
export class ConsoleModule {}
