import { IsNotEmpty } from 'class-validator';
export class reportParam {
  agentId: bigint;
  advertiserId: bigint;
  adMaterialId: bigint;
  startDate: string;
  endDate: string;
}
