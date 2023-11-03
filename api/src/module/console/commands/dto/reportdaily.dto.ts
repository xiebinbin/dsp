import { IsNotEmpty } from 'class-validator';

export class ReportDailyDto {
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  agentId: bigint;

  @IsNotEmpty()
  agentName: string;

  @IsNotEmpty()
  advertiserId: bigint;

  @IsNotEmpty()
  advertiserName: string;

  @IsNotEmpty()
  adMaterialId: bigint;

  @IsNotEmpty()
  adMaterialName: string;

  @IsNotEmpty()
  adPlacementId: bigint;

  @IsNotEmpty()
  adPlacementName: string;

  @IsNotEmpty()
  displayCount: bigint;

  @IsNotEmpty()
  clickCount: bigint;

  @IsNotEmpty()
  usedBudget: bigint;
  createdAt: string;

  updatedAt: string;
}
