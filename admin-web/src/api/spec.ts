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

const remove = (id: bigint) => {
  return createRequestInstance().delete(`/api/admin/adspec/${id}`);
};

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: specEditDto[];
}> => {
  return createRequestInstance().post("/api/admin/adspec/list", params);
};

const getInfo = (id: bigint): Promise<Adspec> => {
  return createRequestInstance().get(`/api/admin/adspec/${id}`);
};
const create = (params: specEditDto): Promise<Adspec> => {
  return createRequestInstance().post("/api/admin/adspec/store", params);
};
const update = (id: bigint, params: specEditDto): Promise<Adspec> => {
  return createRequestInstance().put(`/api/admin/adspec/${id}`, params);
};

const getSpecsList = (): Promise<AdspecOpt[]> => {
  return createRequestInstance().get(`/api/admin/adspec/specoptlist`);
};
export default {
  remove,
  getList,
  getInfo,
  create,
  update,
  getSpecsList,
};
