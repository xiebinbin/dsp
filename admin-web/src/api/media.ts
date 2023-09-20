import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { Admedia, AdmediaOpt, GetListDto } from "@/shims";

export interface MediaEditDto {
  id: number;
  name: string;
  enabled: number;
  // 媒体类型 1网站 2pc软件
  type: number;
  createdAt: string;
  updatedAt: string;
}

const remove = (id: bigint) => {
  return createRequestInstance().delete(`/api/admin/media/${id}`);
};

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: MediaEditDto[];
}> => {
  return createRequestInstance().post("/api/admin/media/list", params);
};

const getInfo = (id: bigint): Promise<Admedia> => {
  return createRequestInstance().get(`/api/admin/media/${id}`);
};
const create = (params: MediaEditDto): Promise<Admedia> => {
  return createRequestInstance().post("/api/admin/media/store", params);
};
const update = (id: bigint, params: MediaEditDto): Promise<Admedia> => {
  return createRequestInstance().put(`/api/admin/media/${id}`, params);
};

const getMediasList = (): Promise<AdmediaOpt[]> => {
    return createRequestInstance().get(`/api/admin/media/mediaslist`);
  };
export default {
  remove,
  getList,
  getInfo,
  create,
  update,
  getMediasList,
};
