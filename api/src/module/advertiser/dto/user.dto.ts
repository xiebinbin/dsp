import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: bigint;
  @IsNotEmpty()
  nickname: string;
  taxnumber: string;
  @IsNotEmpty()
  username: string;
  password: string;
  @IsNotEmpty()
  role: string;
  updatedAt: string;
  @IsNotEmpty()
  enabled: boolean;
}
