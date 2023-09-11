import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  inputCode: string;
  @IsNotEmpty()
  codeid: string;
}

export class UserUpdateDto {
  @IsNotEmpty()
  id: bigint;
  @IsNotEmpty()
  nickname: string;
  @IsNotEmpty()
  username: string;
  password: string;
  @IsNotEmpty()
  role: string;
  updatedAt: string;
  @IsNotEmpty()
  enabled: boolean;
}
export enum Role {
  Root,
  Agent,
  Operator,
}
