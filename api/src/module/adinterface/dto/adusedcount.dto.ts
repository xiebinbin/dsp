import { IsNotEmpty } from 'class-validator';

export class AdUsedCountDto {
  @IsNotEmpty()
  adMaterialId: bigint;
  @IsNotEmpty()
  placementId: bigint;
  @IsNotEmpty()
  adCount: number;
  countType: number;
}
