import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { GetListDto, AdPlacement } from "@/shims";

export interface PlacementEditDto {
  name: string;
  // 广告素材
  adMaterialId: bigint;
  // 预算金额上限
  budget: bigint;
  // 媒体类型
  mediaType: number;
  // 开始日期
  startedAt: string;
  // 结束日期
  endedAt: string;
  // 已消耗预算
  usedBudget: bigint;
  // 展现次数
  displayCount: bigint;
  // 点击次数
  clickCount: bigint;
  advertiserId: bigint;
  updatedAt: string;
  mediarelation: MediarelationDto[];
}

interface MediarelationDto {
  mediaId: bigint;
  placementId: bigint;
}

const getDetailInfo = (id: bigint): Promise<AdPlacement> => {
  return createRequestInstance().get(`/api/advertiser/placement/detail/${id}`);
};

const getListByAdvertiser = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdPlacement[];
}> => {
  return createRequestInstance().post(
    "/api/advertiser/placement/listbyadvertiser",
    params
  );
};
export default { 
  getDetailInfo,
  getListByAdvertiser,
};
