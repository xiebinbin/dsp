import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { Adposition, AdpositionOpt, GetListDto } from "@/shims";

export interface PositionEditDto {
  id: number;
  name: string;
  enabled: number;
  type: number; // 媒体类型 1网站 2pc软件
  adSpecId: number;
  adMediaId: number;
  adSpec: {
    id: number;
    name: string;
  };
  adMedia: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const remove = (id: bigint) => {
  return createRequestInstance().delete(`/api/admin/position/${id}`);
};

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: PositionEditDto[];
}> => {
  return createRequestInstance().post("/api/admin/position/list", params);
};

const getInfo = (id: bigint): Promise<Adposition> => {
  return createRequestInstance().get(`/api/admin/position/${id}`);
};
const create = (params: PositionEditDto): Promise<Adposition> => {
  return createRequestInstance().post("/api/admin/position/store", params);
};
const update = (id: bigint, params: PositionEditDto): Promise<Adposition> => {
  return createRequestInstance().put(`/api/admin/position/${id}`, params);
};

const getPositionsList = (): Promise<AdpositionOpt[]> => {
  return createRequestInstance().get(`/api/admin/Position/positionoptlist`);
};
export default {
  remove,
  getList,
  getInfo,
  create,
  update,
  getPositionsList,
};
