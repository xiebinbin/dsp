import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { GetListDto,   AdPlacement } from "@/shims";

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

const remove = (id: bigint) => {
  return createRequestInstance().delete(`/api/admin/placement/${id}`);
};

const getList = (
  params: GetListDto
): Promise<{ data: AdPlacement[]; total: number }> => {
  return createRequestInstance().post("/api/admin/placement/list", params);
};

const getInfo = (id: bigint): Promise<AdPlacement> => {
  return createRequestInstance().get(`/api/admin/placement/${id}`);
};
const create = (params: PlacementEditDto): Promise<AdPlacement> => {
  return createRequestInstance().post("/api/admin/placement/store", params);
};
const update = (id: bigint, params: PlacementEditDto): Promise<AdPlacement> => {
  return createRequestInstance().put(`/api/admin/placement/${id}`, params);
};
const getDetailInfo = (id: bigint): Promise<AdPlacement> => {
  return createRequestInstance().get(`/api/admin/placement/detail/${id}`);
};

const getListByAdvertiser = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdPlacement[];
}> => {
  return createRequestInstance().post(
    "/api/admin/placement/listbyadvertiser",
    params
  );
};
const pending = (id: bigint,enabled: number) => {
  return createRequestInstance().put(`/api/admin/placement/pending/${id}`, {enabled});
};

export default {
  remove,
  getList,
  getInfo,
  create,
  update,
  getDetailInfo,
  getListByAdvertiser,
  pending,
};
