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

export enum Role {
  Root,
  Agent,
  Operator,
}
