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
export interface MediaParams {
  type: number;
}

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: MediaEditDto[];
}> => {
  return createRequestInstance().post("/api/advertiser/media/list", params);
};

const getInfo = (id: bigint): Promise<Admedia> => {
  return createRequestInstance().get(`/api/advertiser/media/${id}`);
};

const postMediasList = (params?: MediaParams): Promise<AdmediaOpt[]> => {
  return createRequestInstance().post(`/api/advertiser/media/mediaslist`, params);
};
export default {
  getList,
  getInfo,
  postMediasList,
};
