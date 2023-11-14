import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { Adspec, AdspecOpt, GetListDto } from "@/shims";

export interface specEditDto {
  id: number;
  name: string;
  enabled: number;
  type: number; // 媒体类型 1图片2视频
  size: string;
  createdAt: string;
  updatedAt: string;
}

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: specEditDto[];
}> => {
  return createRequestInstance().post("/api/advertiser/adspec/list", params);
};

const getInfo = (id: bigint): Promise<Adspec> => {
  return createRequestInstance().get(`/api/advertiser/adspec/${id}`);
};

const getSpecsList = (): Promise<AdspecOpt[]> => {
  return createRequestInstance().get(`/api/advertiser/adspec/specoptlist`);
};
export default {
  getList,
  getInfo,
  getSpecsList,
};
