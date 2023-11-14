export class PositionDto {
  id: number;
  name: string;
  type: number;
  enabled: boolean;
  adSpecId: bigint;
  adSpec: { id: number; name: string };
  adMediaId: bigint;
  adMedia: { id: number; name: string };
  cpmPrice: number;
  createdAt: string;
  updatedAt: string;
}
