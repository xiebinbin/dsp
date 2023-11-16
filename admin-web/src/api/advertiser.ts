import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { Advertiser, AdvertiserOpt, GetListDto } from "@/shims";
export interface AdvEditDto {
  companyName: string;
  username: string;
  domainName: string;
  password?: string;
  confirmPassword?: string;
  enabled: boolean;
  userId: number;
  role: "Advertiser";
}
export interface reportagentlistDto {
  id: number;
  name: string;
}
const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: Advertiser[];
}> => {
  return createRequestInstance().post("/api/admin/advertiser/list", params);
};
const getOptList = (params: GetListDto): Promise<AdvertiserOpt[]> => {
  return createRequestInstance().post("/api/admin/advertiser/optlist", params);
};
const getInfo = (id: bigint): Promise<Advertiser> => {
  return createRequestInstance().get(`/api/admin/advertiser/${id}`);
};
const create = (params: AdvEditDto): Promise<Advertiser> => {
  return createRequestInstance().post("/api/admin/advertiser/store", params);
};
const update = (id: bigint, params: AdvEditDto): Promise<AdvEditDto> => {
  return createRequestInstance().put(`/api/admin/advertiser/${id}`, {
    id,
    ...params,
  });
};
const getreportagentlist = (): Promise<reportagentlistDto[]> => {
  return createRequestInstance().post("/api/admin/advertiser/reportagentlist");
};

const remove = (id: bigint): Promise<boolean> => {
  return createRequestInstance().delete(`/api/admin/advertiser/${id}`);
};
export default {
  getList,
  getInfo,
  update,
  create,
  remove,
  getOptList,
  getreportagentlist,
};
