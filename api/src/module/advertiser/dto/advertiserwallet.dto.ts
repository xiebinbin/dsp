import { IsNotEmpty } from 'class-validator';

export class AdvertiserWallet {
  @IsNotEmpty()
  id: bigint;
  wallet: {
    balance: number;
  };
}
