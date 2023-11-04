import { IsNotEmpty } from 'class-validator';

export class ReportDto {
  @IsNotEmpty()
  date: Date;
  displayCount: number;
  clickCount: number;
  usedBudget: number;
}
