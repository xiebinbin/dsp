import { IsNotEmpty } from 'class-validator';

export class mediarelationDto {
  @IsNotEmpty()
  mediaId: bigint;
  enabled: boolean;
  //   createdAt: string;
  //   updatedAt: string;
  @IsNotEmpty()
  placementId: bigint;
}
