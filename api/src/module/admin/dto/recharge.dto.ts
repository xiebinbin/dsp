import { IsNotEmpty } from 'class-validator';

export class RechargeDto {
  @IsNotEmpty()
  id: bigint;
  @IsNotEmpty()
  companyName: string;
  @IsNotEmpty()
  currentBalance: number;
  @IsNotEmpty()
  amount: number;
  remark: string;
  billdate: Date;
}
