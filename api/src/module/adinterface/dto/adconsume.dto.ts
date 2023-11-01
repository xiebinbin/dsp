import { IsNotEmpty } from 'class-validator';

export class AdConsumeDto {
  @IsNotEmpty()
  advertiserId: bigint;
  @IsNotEmpty()
  adMaterialId: bigint;
  @IsNotEmpty()
  placementId: bigint;
  @IsNotEmpty()
  amount: number;
  cpmPrice: number;
}
