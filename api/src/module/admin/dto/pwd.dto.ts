import { IsNotEmpty } from 'class-validator';

export class PwdDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  oldPassword: string;
  @IsNotEmpty()
  confirmPassword: string;
}
