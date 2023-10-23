import { IsNotEmpty } from 'class-validator';
export class reportParam {
  startDate: string;
  endDate: string;
  advertiserId: bigint;
  adPlacementId: bigint;
}
