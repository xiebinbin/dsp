import { IsNotEmpty } from 'class-validator';

export class AdvDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  companyName: string;
  domainName: string;
  wallet: { balance: number };
  @IsNotEmpty()
  username: string;
  password: string;
  cpmPrice: number;
  userId: number;
  operatorId: number;
  updatedAt: string;
  @IsNotEmpty()
  enabled: boolean;
  user: { id: number; name: string };
  operator: { id: number; name: string };
}
