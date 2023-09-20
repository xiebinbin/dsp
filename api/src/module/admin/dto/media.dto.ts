import { IsNotEmpty } from 'class-validator';

export class mediaDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
  enabled: boolean;
  // 类型 1 网站 2pc 软件
  type: number;
  createdAt: string;
  updatedAt: string;
}
