import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {
  GetListDto,
  AdMaterial,
  AdMaterialAgent,
  AdvertiserOpt,
} from "@/shims";

export interface MaterialEditDto {
  name: string;
  // 媒体类型 1网站 2pc软件
  mediaType: number;
  // 类型 1:图片 2:视频 3:文字
  contentType: number;
  // 广告位置 1.列表页 2.详情页 3.侧边栏 4.全屏弹窗(仅 pc 有)
  position: number;
  // 广告内容
  content: string;
  // 广告链接
  url: string;
  enabled: boolean;
  advertiser: bigint;
  jumpurl: string;
}

const remove = (id: bigint) => {
  return createRequestInstance().delete(`/api/admin/material/${id}`);
};

const getList = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdMaterial[];
}> => {
  return createRequestInstance().post("/api/admin/material/list", params);
};
const getOptList = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdvertiserOpt[];
}> => {
  return createRequestInstance().post("/api/admin/material/optlist", params);
};
const getInfo = (id: bigint): Promise<AdMaterial> => {
  return createRequestInstance().get(`/api/admin/material/${id}`);
};
const create = (params: MaterialEditDto): Promise<AdMaterial> => {
  return createRequestInstance().post("/api/admin/material/store", params);
};
const update = (id: bigint, params: MaterialEditDto): Promise<AdMaterial> => {
  return createRequestInstance().put(`/api/admin/material/${id}`, params);
};
const getDetailInfo = (id: bigint): Promise<AdMaterialAgent> => {
  return createRequestInstance().get(`/api/admin/material/detail/${id}`);
};

const getListByAdvertiser = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdMaterial[];
}> => {
  return createRequestInstance().post(
    "/api/admin/material/listbyadvertiser",
    params
  );
};

export default {
  remove,
  getList,
  getInfo,
  create,
  update,
  getDetailInfo,
  getListByAdvertiser,
  getOptList,
};
