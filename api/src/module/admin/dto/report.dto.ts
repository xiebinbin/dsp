import { IsNotEmpty } from 'class-validator';

export class ReportDto {
  @IsNotEmpty()
  //   id: bigint;
  //   date: string;
  //   agentId: bigint;
  //   agentName: string;
  //   advertiserId: bigint;
  //   advertiserName: string;
  //   adMaterialId: bigint;
  //   adMaterialName: string;
  //   displayCount: bigint;
  //   clickCount: bigint;
  //   usedBudget: bigint;
  date: Date;
  displayCount: bigint;
  clickCount: bigint;
  usedBudget: bigint;
}
