import { IsNotEmpty } from 'class-validator';

export class ReportPlacementDto {
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
  @IsNotEmpty()
  startedAt: string;
  @IsNotEmpty()
  // 结束日期
  endedAt: string;
  createdAt: string;
  updatedAt: string;
}
