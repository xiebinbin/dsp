import { IsNotEmpty } from 'class-validator';

export class ReportDto {
  @IsNotEmpty()
  date: string;
  displayCount: number;
  clickCount: number;
  usedBudget: number;
}
