import { IsNotEmpty } from 'class-validator';

export class PlacementDto {
  @IsNotEmpty()
  id: bigint;
  name: string;
  enabled: number;
  @IsNotEmpty()
  adMaterialId: bigint;
  @IsNotEmpty()

  // 预算金额上限
  budget: bigint;
  cpmPrice: number;
  // 媒体类型:
  mediaType: number;
  @IsNotEmpty()

  // 开始日期
  startedAt: string;
  @IsNotEmpty()

  // 结束日期
  endedAt: string;
  // 已消耗预算
  usedBudget: bigint;
  // 展现次数
  displayCount: bigint;
  // 点击次数
  clickCount: bigint;
  @IsNotEmpty()
  advertiserId: bigint;
  // mediarelation: mediarelationDto[];
  medias: [];
  timerange: {
    range: Date[];
  }[];
}
