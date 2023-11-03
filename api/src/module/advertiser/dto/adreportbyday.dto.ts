import { IsNotEmpty } from 'class-validator';

export class AdReportByDayDto {
  @IsNotEmpty()
  date: string;
  @IsNotEmpty()
  placementId: number;
  @IsNotEmpty()
  usedBudget: number;
  displayCount: number;
  clickCount: number;
}
